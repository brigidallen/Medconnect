# MedConnect - Quick Start Guide

Get MedConnect running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- Twilio account (credentials already in .env)

## Steps

### 1. Install Dependencies

Open two terminal windows.

**Terminal 1 (Backend):**
```bash
cd backend
npm install
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
```

### 2. Start the Application

**Terminal 1 (Backend):**
```bash
npm start
```

You should see:
```
🏥 MedConnect Backend Server
================================
✓ Server running on port 3000
✓ Twilio webhook: http://localhost:3000/sms
✓ Socket.io ready for real-time updates
✓ Mock data loaded: 5 requests
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 3. View the Dashboard

Open your browser to: **http://localhost:5173**

You should see the MedConnect dashboard with 5 mock historical requests!

### 4. Test with SMS (Optional)

To test SMS functionality locally:

1. Install ngrok: `npm install -g ngrok`
2. Run: `ngrok http 3000`
3. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
4. Go to Twilio Console → Phone Numbers → Your Number
5. Set webhook to: `https://abc123.ngrok.io/sms`
6. Text your Twilio number: `BLOOD O-NEG 2`
7. Watch it appear on the dashboard!

## Test Messages

Try these SMS formats:
- `BLOOD O-NEG 2`
- `BLOOD A-POS 5`
- `MEDICINE INSULIN 10`
- `MEDICINE EPINEPHRINE 5`
- `EMERGENCY TRAUMA KIT`

## Dashboard Features

✓ Real-time updates (<1 second)
✓ Color-coded urgency (Red=Critical/Blood, Yellow=Medicine, Green=Supplies)
✓ Auto-assigned providers
✓ Live provider status
✓ Timestamp tracking
✓ Request history

## Common Issues

**Backend won't start:**
- Check if port 3000 is already in use
- Run: `lsof -ti:3000 | xargs kill -9` to free the port

**Frontend won't start:**
- Check if port 5173 is already in use
- Delete `node_modules` and run `npm install` again

**Dashboard not updating:**
- Check browser console for errors
- Verify backend is running on port 3000
- Refresh the page

## Next Steps

1. Read the full README.md for deployment instructions
2. Customize providers in `backend/server.js`
3. Deploy to Render + Vercel for production

## Support

Questions? Check README.md or open a GitHub issue.

---

**You're all set! 🚀**
