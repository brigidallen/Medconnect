# MedConnect - Emergency Medical Dispatch System

A real-time emergency medical dispatch demo system that receives SMS requests and displays them on a live dashboard with automatic provider assignment.

## Features

- **SMS Integration**: Receive emergency requests via Twilio SMS
- **Real-time Dashboard**: Live updates using Socket.io (<1 second latency)
- **Auto-Assignment**: Automatic provider matching and assignment
- **Color-coded Urgency**: Visual priority system (Red=Blood, Yellow=Medicine, Green=Supplies)
- **Mock Provider Status**: Simulated provider availability
- **Professional UI**: Clean medical dispatch interface with Tailwind CSS

## Demo Flow

1. User texts: `BLOOD O-NEG 2` to Twilio number
2. Request appears instantly on web dashboard
3. System auto-assigns to available provider (Zipline, DroneLink, etc.)
4. SMS reply: `MedConnect Alert: Blood O-NEG x2 units confirmed. Provider: Zipline. ETA: 18 minutes. Track: MC-001`

## Tech Stack

- **Backend**: Node.js, Express, Socket.io, Twilio
- **Frontend**: React, Vite, Tailwind CSS
- **Database**: In-memory array (demo purposes)
- **Deployment**: Render (backend), Vercel (frontend)

## SMS Message Formats

The system accepts three types of emergency requests:

```
BLOOD [type] [units]
Example: BLOOD O-NEG 2

MEDICINE [name] [quantity]
Example: MEDICINE INSULIN 10

EMERGENCY [description]
Example: EMERGENCY TRAUMA KIT
```

## Project Structure

```
Medconnect/
├── backend/
│   ├── server.js          # Express server with Socket.io & Twilio
│   ├── package.json
│   └── .env               # Twilio credentials
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Real-time dashboard
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env               # Backend URL
└── README.md
```

## Local Development Setup

### Prerequisites

- Node.js 18+ installed
- Twilio account (free tier works)
- npm or yarn

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

**Backend** (`backend/.env`):
```env
TWILIO_ACCOUNT_SID=US3d497743de0f1df09bfb75b65c21dece
TWILIO_AUTH_TOKEN=6f88c50a956d9ed189187ad7ba9bac1a
TWILIO_PHONE_NUMBER=+18339650599
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`frontend/.env`):
```env
VITE_BACKEND_URL=http://localhost:3000
```

### 3. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

Server will start on `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Dashboard will open on `http://localhost:5173`

### 4. Test Locally with Twilio Webhook

To test SMS locally, you need to expose your local server using ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Expose port 3000
ngrok http 3000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`) and configure Twilio:

1. Go to Twilio Console → Phone Numbers → Active Numbers
2. Click your phone number
3. Under "Messaging Configuration"
4. Set webhook to: `https://abc123.ngrok.io/sms`
5. HTTP Method: POST
6. Save

Now text your Twilio number to see requests appear in real-time!

## Production Deployment

### Deploy Backend to Render (Free Tier)

1. **Create Render Account**: Go to [render.com](https://render.com)

2. **Create New Web Service**:
   - Connect your GitHub repo
   - Name: `medconnect-backend`
   - Environment: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Plan: Free

3. **Set Environment Variables** in Render Dashboard:
   ```
   TWILIO_ACCOUNT_SID=US3d497743de0f1df09bfb75b65c21dece
   TWILIO_AUTH_TOKEN=6f88c50a956d9ed189187ad7ba9bac1a
   TWILIO_PHONE_NUMBER=+18339650599
   PORT=3000
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

4. **Deploy** - Render will provide a URL like: `https://medconnect-backend.onrender.com`

### Deploy Frontend to Vercel (Free Tier)

1. **Create Vercel Account**: Go to [vercel.com](https://vercel.com)

2. **Import Project**:
   - Import from GitHub
   - Root Directory: `frontend`
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Set Environment Variables** in Vercel Dashboard:
   ```
   VITE_BACKEND_URL=https://medconnect-backend.onrender.com
   ```

4. **Deploy** - Vercel will provide a URL like: `https://medconnect.vercel.app`

### Configure Twilio Webhook for Production

1. Go to Twilio Console → Phone Numbers
2. Select your number
3. Set webhook URL to: `https://medconnect-backend.onrender.com/sms`
4. Save

### Update Backend FRONTEND_URL

In Render dashboard, update environment variable:
```
FRONTEND_URL=https://medconnect.vercel.app
```

Redeploy backend for changes to take effect.

## Testing the Production System

Send an SMS to your Twilio number:
```
BLOOD A-POS 3
```

You should:
1. Receive SMS reply with confirmation
2. See request appear on dashboard at `https://medconnect.vercel.app`
3. Request shows provider, ETA, and tracking ID

## API Endpoints

- `POST /sms` - Twilio webhook for incoming SMS
- `GET /requests` - Get all requests
- `GET /providers` - Get provider status
- `GET /health` - Health check

## Mock Data

The system pre-loads with 5 historical requests to demonstrate the dashboard functionality:
- Blood O-NEG (2 units) - En Route
- Medicine Insulin (10 units) - Confirmed
- Blood A-POS (3 units) - Delivered
- Medicine Epinephrine (5 units) - En Route
- Emergency Trauma Kit - Dispatched

## Troubleshooting

### SMS not received by backend
- Check Twilio webhook URL is correct
- Verify backend is running and accessible
- Check backend logs for errors

### Dashboard not updating
- Check frontend can reach backend URL
- Verify Socket.io connection (check browser console)
- Ensure CORS is properly configured

### Render free tier sleep
- Free tier apps sleep after 15 min of inactivity
- First request after sleep takes ~30 seconds
- Upgrade to paid tier for always-on service

## Cost Breakdown (Free Tier)

- **Render Backend**: Free (750 hours/month)
- **Vercel Frontend**: Free (100GB bandwidth)
- **Twilio**: Free trial credits (~$15)
  - SMS: ~$0.0075 per message
  - Phone number: ~$1/month after trial

**Total Demo Cost**: $0 for first month with trial credits

## Development

### Add New Request Types

Edit `backend/server.js`, add to `parseSMS()` function:

```javascript
const supplyMatch = msg.match(/^SUPPLY\s+([\w-]+)\s+(\d+)$/i);
if (supplyMatch) {
  return {
    type: 'SUPPLY',
    item: supplyMatch[1].toUpperCase(),
    quantity: `${supplyMatch[2]} units`,
    urgency: 'low'
  };
}
```

### Customize Providers

Edit `backend/server.js`, modify `providers` array:

```javascript
const providers = [
  { name: 'YourProvider', status: 'Available', eta: '10-15 min' },
  // ...
];
```

## License

MIT

## Support

For issues or questions, please open a GitHub issue.

---

Built with ❤️ for emergency medical response
