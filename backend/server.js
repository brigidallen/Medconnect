import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// In-memory storage
let requests = [];
let requestCounter = 1;

// Mock providers with availability
const providers = [
  { name: 'Zipline', status: 'Available', eta: '15-20 min' },
  { name: 'DroneLink', status: 'Available', eta: '18-25 min' },
  { name: 'MediAir', status: 'Busy', eta: '30-35 min' },
  { name: 'QuickMed', status: 'Available', eta: '12-18 min' },
];

// Initialize with mock data
const initializeMockData = () => {
  const mockRequests = [
    {
      id: 'MC-001',
      type: 'BLOOD',
      item: 'O-NEG',
      quantity: '2 units',
      urgency: 'high',
      provider: 'Zipline',
      eta: '18 minutes',
      status: 'En Route',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      phoneNumber: '+1234567890'
    },
    {
      id: 'MC-002',
      type: 'MEDICINE',
      item: 'INSULIN',
      quantity: '10 units',
      urgency: 'medium',
      provider: 'DroneLink',
      eta: '22 minutes',
      status: 'Confirmed',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      phoneNumber: '+1234567891'
    },
    {
      id: 'MC-003',
      type: 'BLOOD',
      item: 'A-POS',
      quantity: '3 units',
      urgency: 'high',
      provider: 'QuickMed',
      eta: '15 minutes',
      status: 'Delivered',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      phoneNumber: '+1234567892'
    },
    {
      id: 'MC-004',
      type: 'MEDICINE',
      item: 'EPINEPHRINE',
      quantity: '5 units',
      urgency: 'medium',
      provider: 'Zipline',
      eta: '20 minutes',
      status: 'En Route',
      timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      phoneNumber: '+1234567893'
    },
    {
      id: 'MC-005',
      type: 'EMERGENCY',
      item: 'TRAUMA KIT',
      quantity: '1 kit',
      urgency: 'critical',
      provider: 'DroneLink',
      eta: '12 minutes',
      status: 'Dispatched',
      timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      phoneNumber: '+1234567894'
    }
  ];

  requests = mockRequests;
  requestCounter = 6;
  console.log('✓ Mock data initialized with 5 historical requests');
};

// Parse SMS message
const parseSMS = (message) => {
  const msg = message.trim().toUpperCase();

  // BLOOD [type] [units]
  const bloodMatch = msg.match(/^BLOOD\s+([A-Z][-+]?(?:NEG|POS)?)\s+(\d+)$/i);
  if (bloodMatch) {
    return {
      type: 'BLOOD',
      item: bloodMatch[1].toUpperCase(),
      quantity: `${bloodMatch[2]} units`,
      urgency: 'high'
    };
  }

  // MEDICINE [name] [quantity]
  const medicineMatch = msg.match(/^MEDICINE\s+([\w-]+)\s+(\d+)$/i);
  if (medicineMatch) {
    return {
      type: 'MEDICINE',
      item: medicineMatch[1].toUpperCase(),
      quantity: `${medicineMatch[2]} units`,
      urgency: 'medium'
    };
  }

  // EMERGENCY [description]
  const emergencyMatch = msg.match(/^EMERGENCY\s+(.+)$/i);
  if (emergencyMatch) {
    return {
      type: 'EMERGENCY',
      item: emergencyMatch[1].toUpperCase(),
      quantity: '1 kit',
      urgency: 'critical'
    };
  }

  return null;
};

// Assign mock provider
const assignProvider = () => {
  const availableProviders = providers.filter(p => p.status === 'Available');
  const provider = availableProviders.length > 0
    ? availableProviders[Math.floor(Math.random() * availableProviders.length)]
    : providers[Math.floor(Math.random() * providers.length)];

  const etaMatch = provider.eta.match(/(\d+)-(\d+)/);
  const minEta = etaMatch ? parseInt(etaMatch[1]) : 15;
  const maxEta = etaMatch ? parseInt(etaMatch[2]) : 20;
  const eta = Math.floor(Math.random() * (maxEta - minEta + 1)) + minEta;

  return {
    name: provider.name,
    eta: `${eta} minutes`
  };
};

// Generate request ID
const generateRequestId = () => {
  const id = `MC-${String(requestCounter).padStart(3, '0')}`;
  requestCounter++;
  return id;
};

// SMS webhook endpoint
app.post('/sms', async (req, res) => {
  try {
    const { Body, From } = req.body;

    console.log(`📱 Incoming SMS from ${From}: ${Body}`);

    // Parse the SMS
    const parsed = parseSMS(Body);

    if (!parsed) {
      // Invalid format
      console.log('❌ Invalid SMS format');
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Invalid format. Use:
BLOOD [type] [units]
MEDICINE [name] [quantity]
EMERGENCY [description]

Example: BLOOD O-NEG 2</Message>
</Response>`;
      res.type('text/xml').send(twiml);
      return;
    }

    // Assign provider
    const assignment = assignProvider();

    // Create request
    const request = {
      id: generateRequestId(),
      ...parsed,
      provider: assignment.name,
      eta: assignment.eta,
      status: 'Confirmed',
      timestamp: new Date().toISOString(),
      phoneNumber: From
    };

    // Add to storage
    requests.push(request);

    // Emit to all connected clients
    io.emit('newRequest', request);

    console.log(`✓ Request ${request.id} created and assigned to ${assignment.name}`);

    // Send Twilio response
    const responseMessage = `MedConnect Alert: ${parsed.item} x${parsed.quantity} confirmed. Provider: ${assignment.name}. ETA: ${assignment.eta}. Track: ${request.id}`;

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${responseMessage}</Message>
</Response>`;

    res.type('text/xml').send(twiml);

  } catch (error) {
    console.error('Error processing SMS:', error);
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Error processing request. Please try again.</Message>
</Response>`;
    res.type('text/xml').send(twiml);
  }
});

// Get all requests
app.get('/requests', (req, res) => {
  res.json(requests);
});

// Get providers
app.get('/providers', (req, res) => {
  res.json(providers);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    requestCount: requests.length
  });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Send current requests to new client
  socket.emit('initialData', { requests, providers });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Initialize and start server
const PORT = process.env.PORT || 3000;

initializeMockData();

httpServer.listen(PORT, () => {
  console.log('\n🏥 MedConnect Backend Server');
  console.log('================================');
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Twilio webhook: http://localhost:${PORT}/sms`);
  console.log(`✓ Socket.io ready for real-time updates`);
  console.log(`✓ Mock data loaded: ${requests.length} requests\n`);

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn('⚠️  Warning: Twilio credentials not configured in .env file');
  }
});
