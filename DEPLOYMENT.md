# MedConnect - Production Deployment Guide

Complete step-by-step guide to deploy MedConnect to production using free tiers.

## Architecture Overview

```
SMS (Twilio) → Backend (Render) → Frontend (Vercel)
                    ↓
              Socket.io Real-time Updates
```

## Prerequisites Checklist

- [ ] GitHub account
- [ ] Render.com account (free)
- [ ] Vercel.com account (free)
- [ ] Twilio account with active phone number
- [ ] Code pushed to GitHub repository

---

## Part 1: Deploy Backend to Render

### Step 1: Sign Up for Render

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended)

### Step 2: Create New Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select the `Medconnect` repository
4. Configure the service:

```
Name: medconnect-backend
Region: Oregon (US West)
Branch: claude/medconnect-dispatch-system-01MeQ7hNVm1YFce6KHn11WeM
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Plan: Free
```

### Step 3: Add Environment Variables

In the Render dashboard, go to "Environment" and add:

```
TWILIO_ACCOUNT_SID = US3d497743de0f1df09bfb75b65c21dece
TWILIO_AUTH_TOKEN = 6f88c50a956d9ed189187ad7ba9bac1a
TWILIO_PHONE_NUMBER = +18339650599
PORT = 3000
FRONTEND_URL = https://medconnect.vercel.app
NODE_ENV = production
```

**Note:** You'll update `FRONTEND_URL` after deploying the frontend.

### Step 4: Deploy

1. Click "Create Web Service"
2. Wait 2-3 minutes for deployment
3. Copy your backend URL (e.g., `https://medconnect-backend.onrender.com`)

### Step 5: Test Backend

```bash
curl https://YOUR-BACKEND-URL.onrender.com/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-11-15T...",
  "requestCount": 5
}
```

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Sign Up for Vercel

1. Go to https://vercel.com
2. Click "Sign Up"
3. Sign up with GitHub (recommended)

### Step 2: Import Project

1. Click "Add New..." → "Project"
2. Import your GitHub repository
3. Configure the project:

```
Project Name: medconnect
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Step 3: Add Environment Variables

Click "Environment Variables" and add:

```
VITE_BACKEND_URL = https://YOUR-BACKEND-URL.onrender.com
```

Replace with your actual Render backend URL from Part 1, Step 4.

### Step 4: Deploy

1. Click "Deploy"
2. Wait 1-2 minutes for deployment
3. Copy your frontend URL (e.g., `https://medconnect.vercel.app`)

### Step 5: Update Backend FRONTEND_URL

1. Go back to Render dashboard
2. Navigate to your backend service
3. Go to "Environment" tab
4. Update `FRONTEND_URL` to your Vercel URL
5. Save changes (this will trigger a redeploy)

---

## Part 3: Configure Twilio Webhook

### Step 1: Access Twilio Console

1. Go to https://console.twilio.com
2. Navigate to Phone Numbers → Manage → Active Numbers
3. Click on your phone number: `+18339650599`

### Step 2: Configure Webhook

Under "Messaging Configuration":

```
A MESSAGE COMES IN:
- Webhook: https://YOUR-BACKEND-URL.onrender.com/sms
- HTTP Method: POST
- Save
```

Replace `YOUR-BACKEND-URL` with your actual Render URL.

### Step 3: Test the Webhook

Send a test SMS to your Twilio number:
```
BLOOD O-NEG 2
```

You should:
1. ✅ Receive SMS reply with confirmation
2. ✅ See request appear on dashboard at your Vercel URL
3. ✅ Request shows provider, ETA, and tracking ID

---

## Part 4: Verify Full System

### Test Checklist

- [ ] Backend health check responds: `curl https://YOUR-BACKEND-URL/health`
- [ ] Frontend loads at your Vercel URL
- [ ] Dashboard shows 5 mock requests
- [ ] System status shows "Online" (green dot)
- [ ] Provider status cards display
- [ ] Send SMS: `BLOOD A-POS 3`
- [ ] Receive SMS confirmation reply
- [ ] Request appears on dashboard in <1 second
- [ ] Request shows correct urgency color (red for blood)
- [ ] Request shows assigned provider and ETA

### Test All SMS Formats

```
BLOOD O-NEG 2
BLOOD A-POS 5
BLOOD B-NEG 1
MEDICINE INSULIN 10
MEDICINE EPINEPHRINE 5
EMERGENCY TRAUMA KIT
```

---

## Production URLs

After deployment, you'll have:

- **Backend API**: `https://medconnect-backend.onrender.com`
- **Frontend Dashboard**: `https://medconnect.vercel.app`
- **Twilio SMS**: `+18339650599`

---

## Important Notes

### Render Free Tier Limitations

- ⚠️ **Cold Starts**: Service sleeps after 15 minutes of inactivity
- ⚠️ **First Request**: Takes ~30 seconds to wake up
- ⚠️ **Solution**: Upgrade to paid tier ($7/month) for always-on service
- ✅ **Workaround**: Set up a ping service (like UptimeRobot) to keep it awake

### Vercel Free Tier Limitations

- ✅ 100GB bandwidth/month (more than enough)
- ✅ Unlimited deployments
- ✅ Always-on (no cold starts)
- ✅ Automatic HTTPS

### Twilio Free Trial

- First $15 in credits (free)
- SMS costs ~$0.0075 per message
- ~2000 free messages
- Phone number: ~$1/month after trial

---

## Monitoring & Logs

### View Backend Logs (Render)

1. Go to Render dashboard
2. Click your service
3. Click "Logs" tab
4. See real-time logs of incoming SMS

### View Frontend Logs (Vercel)

1. Go to Vercel dashboard
2. Click your project
3. Click "Deployments" → Latest deployment
4. Click "Runtime Logs"

---

## Troubleshooting

### Backend Issues

**Problem**: Backend won't start
- Check environment variables are set correctly
- View logs in Render dashboard
- Verify `npm install` completed successfully

**Problem**: SMS not received
- Check Twilio webhook URL is correct
- Verify backend is deployed and running
- Check Twilio debugger for errors

### Frontend Issues

**Problem**: Dashboard shows "Offline"
- Check `VITE_BACKEND_URL` environment variable
- Verify backend is running
- Check browser console for CORS errors

**Problem**: Dashboard not updating
- Verify Socket.io connection in browser console
- Check backend logs for connection errors
- Ensure CORS is configured correctly

### SMS Issues

**Problem**: No SMS reply received
- Check Twilio console debugger
- Verify webhook URL is correct
- Check backend logs for errors

**Problem**: Invalid format error
- Verify SMS format: `BLOOD O-NEG 2`
- Check backend logs for parsing errors

---

## Updating the Application

### Update Backend

1. Make changes to code
2. Push to GitHub: `git push origin claude/medconnect-dispatch-system-01MeQ7hNVm1YFce6KHn11WeM`
3. Render auto-deploys from GitHub
4. Wait 2-3 minutes for deployment

### Update Frontend

1. Make changes to code
2. Push to GitHub
3. Vercel auto-deploys from GitHub
4. Wait 1-2 minutes for deployment

---

## Cost Summary

| Service | Free Tier | Paid Option |
|---------|-----------|-------------|
| Render Backend | 750 hours/month | $7/month (always-on) |
| Vercel Frontend | 100GB bandwidth | Free for personal |
| Twilio | $15 trial credits | ~$1/month + $0.0075/SMS |

**Total Monthly Cost**: $0 (with trial) → ~$8/month (production)

---

## Security Best Practices

1. ✅ Never commit `.env` files (already in `.gitignore`)
2. ✅ Use environment variables for secrets
3. ✅ HTTPS enabled by default on Render & Vercel
4. ✅ CORS configured for your frontend domain
5. ⚠️ Consider rate limiting for production
6. ⚠️ Add authentication for admin dashboard

---

## Next Steps After Deployment

1. Share dashboard URL with stakeholders
2. Add custom domain (optional, free on Vercel)
3. Set up uptime monitoring (UptimeRobot)
4. Configure alerts for downtime
5. Add analytics (optional)
6. Consider database for persistent storage

---

## Support

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Twilio Docs**: https://www.twilio.com/docs

---

**You're ready to deploy! Follow the steps above in order.** 🚀
