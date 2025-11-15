# MedConnect Deployment Checklist

Use this checklist to deploy MedConnect in ~15 minutes.

## 🎯 Quick Deploy Steps

### ✅ Part 1: Deploy Backend (Render) - 5 minutes

- [ ] Go to https://render.com
- [ ] Sign up/login with GitHub
- [ ] Click "New +" → "Web Service"
- [ ] Select your `Medconnect` repository
- [ ] Configure:
  - Root Directory: `backend`
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Plan: Free
- [ ] Add Environment Variables:
  ```
  TWILIO_ACCOUNT_SID = US3d497743de0f1df09bfb75b65c21dece
  TWILIO_AUTH_TOKEN = 6f88c50a956d9ed189187ad7ba9bac1a
  TWILIO_PHONE_NUMBER = +18339650599
  PORT = 3000
  FRONTEND_URL = https://medconnect.vercel.app
  NODE_ENV = production
  ```
- [ ] Click "Create Web Service"
- [ ] Wait for deployment to complete
- [ ] **Copy your backend URL**: `https://__________________.onrender.com`

### ✅ Part 2: Deploy Frontend (Vercel) - 5 minutes

- [ ] Go to https://vercel.com
- [ ] Sign up/login with GitHub
- [ ] Click "Add New..." → "Project"
- [ ] Import your `Medconnect` repository
- [ ] Configure:
  - Framework: Vite
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] Add Environment Variable:
  ```
  VITE_BACKEND_URL = [YOUR RENDER BACKEND URL FROM STEP 1]
  ```
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] **Copy your frontend URL**: `https://__________________.vercel.app`

### ✅ Part 3: Update Backend FRONTEND_URL - 1 minute

- [ ] Go back to Render dashboard
- [ ] Click your backend service
- [ ] Go to "Environment" tab
- [ ] Update `FRONTEND_URL` to your Vercel URL
- [ ] Save (will auto-redeploy)

### ✅ Part 4: Configure Twilio - 2 minutes

- [ ] Go to https://console.twilio.com
- [ ] Navigate to Phone Numbers → Manage → Active Numbers
- [ ] Click your number: `+18339650599`
- [ ] Under "Messaging Configuration":
  - Webhook: `[YOUR RENDER BACKEND URL]/sms`
  - HTTP Method: POST
- [ ] Save

### ✅ Part 5: Test Everything - 2 minutes

- [ ] Visit your Vercel frontend URL
- [ ] Verify dashboard shows 5 mock requests
- [ ] Verify "System Status" shows "Online" (green dot)
- [ ] Send test SMS to `+18339650599`:
  ```
  BLOOD O-NEG 2
  ```
- [ ] Verify you receive SMS confirmation reply
- [ ] Verify request appears on dashboard
- [ ] Verify request shows provider and ETA

---

## 🎉 You're Live!

Your deployed URLs:

- **Dashboard**: https://__________________.vercel.app
- **Backend API**: https://__________________.onrender.com
- **SMS Number**: +18339650599

---

## 📱 Test Messages

Send these to your Twilio number:

```
BLOOD O-NEG 2
BLOOD A-POS 5
MEDICINE INSULIN 10
MEDICINE EPINEPHRINE 5
EMERGENCY TRAUMA KIT
```

---

## ⚠️ Important Notes

1. **Render Free Tier**: Backend sleeps after 15 min of inactivity
   - First request takes ~30 seconds to wake up
   - Solution: Upgrade to $7/month for always-on

2. **Twilio Trial**: $15 in free credits
   - ~2000 free SMS messages
   - Then ~$1/month + $0.0075/SMS

3. **Vercel**: Always-on, no cold starts!

---

## 🔧 Troubleshooting

**Dashboard shows "Offline":**
- Check backend is running on Render
- Verify `VITE_BACKEND_URL` is correct in Vercel

**No SMS received:**
- Check Twilio webhook URL
- Check Render backend logs

**SMS error message:**
- Verify format: `BLOOD O-NEG 2`
- Check Twilio debugger console

---

## 📚 Full Documentation

See `DEPLOYMENT.md` for detailed troubleshooting and advanced configuration.

---

**Need help? Check the Render/Vercel/Twilio logs first!**
