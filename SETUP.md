# Setup Guide

This guide will walk you through setting up the AI Phone Calling System step by step.

## Prerequisites Checklist

Before starting, make sure you have:

- [ ] Node.js 18 or higher installed
- [ ] npm or yarn package manager
- [ ] Git installed
- [ ] A code editor (VS Code recommended)

## Step 1: External Services Setup

### 1.1 OpenAI Account

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Save the key securely (starts with `sk-`)
6. **Important**: Request access to the Realtime API if you don't have it

### 1.2 Twilio Account

1. Go to [twilio.com](https://www.twilio.com)
2. Sign up for a new account (get free trial credits)
3. After signup, go to Console Dashboard
4. Note your Account SID and Auth Token
5. Buy a phone number:
   - Go to Phone Numbers → Buy a Number
   - Select a number with Voice capabilities
   - Complete purchase (uses trial credits or billing)
6. Enable Media Streams (required for WebSocket audio):
   - Contact Twilio support or check if it's auto-enabled

### 1.3 Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up and create a new project
3. Wait for project to initialize (~2 minutes)
4. Go to Project Settings → API
5. Copy the Project URL and `service_role` key (NOT the anon key)
6. Go to SQL Editor
7. Copy and paste the contents of `backend/schema.sql`
8. Execute the SQL to create tables

### 1.4 Email Service (Choose One)

#### Option A: Resend (Recommended)

1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Go to API Keys
4. Create a new API key
5. Verify your domain or use their test domain

#### Option B: SendGrid

1. Go to [sendgrid.com](https://sendgrid.com)
2. Sign up for free account
3. Create an API key with "Mail Send" permission
4. Verify a sender email address

## Step 2: Local Installation

### 2.1 Clone Repository

```bash
git clone https://github.com/cpetrula/bolt-ai.git
cd bolt-ai
```

### 2.2 Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+15551234567

# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxx

# Email Service (choose one)
RESEND_API_KEY=re_xxxxxxxxxxxxx
# OR
# SENDGRID_API_KEY=SG.xxxxxxxxxxxxx

# Email Configuration
FROM_EMAIL=noreply@yourdomain.com
NOTIFICATION_EMAIL=yourname@yourdomain.com

# Server Configuration
BACKEND_PORT=8000
FRONTEND_PORT=3000
BACKEND_URL=http://localhost:8000

# AI Agent Configuration
AI_AGENT_NAME=Jack
AI_AGENT_VOICE=alloy
```

### 2.3 Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Or use root command
cd ..
npm run install:all
```

### 2.4 Test Backend

```bash
cd backend
npm start
```

You should see:
```
AI Phone Calling System Backend running on port 8000
Health check: http://localhost:8000/health
```

Open another terminal and test:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "openai": true,
    "twilio": true,
    "supabase": true,
    "email": true
  }
}
```

If any service shows `false`, check your environment variables.

### 2.5 Test Frontend

In a new terminal:
```bash
cd frontend
npm run dev
```

Visit http://localhost:3000

You should see the AI Phone Calling System dashboard.

## Step 3: Local Testing with ngrok

To test Twilio webhooks locally, you need to expose your local server to the internet.

### 3.1 Install ngrok

```bash
# macOS
brew install ngrok

# Or download from https://ngrok.com/download
```

### 3.2 Start ngrok

```bash
ngrok http 8000
```

You'll see output like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:8000
```

### 3.3 Configure Twilio Webhooks

1. Go to Twilio Console → Phone Numbers → Manage → Active Numbers
2. Click on your phone number
3. In "Voice & Fax" section:
   - **A CALL COMES IN**: 
     - Webhook: `https://abc123.ngrok.io/api/inbound-call`
     - HTTP POST
   - **Status Callback URL**: 
     - `https://abc123.ngrok.io/api/call-status`
     - HTTP POST
4. Save

### 3.4 Test Inbound Call

1. Call your Twilio phone number from your mobile phone
2. You should hear the AI agent greeting
3. Have a conversation
4. Check the dashboard at http://localhost:3000 to see the call logged

### 3.5 Test Outbound Call

1. Go to http://localhost:3000
2. Enter a phone number (yours) in the outbound call field
3. Click "Call"
4. You should receive a call from your Twilio number
5. The AI agent will start the conversation

## Step 4: Deploy to Railway

### 4.1 Install Railway CLI

```bash
npm install -g @railway/cli
```

### 4.2 Login to Railway

```bash
railway login
```

### 4.3 Create New Project

```bash
railway init
```

### 4.4 Add Environment Variables

In Railway Dashboard:
1. Go to your project
2. Click on "Variables"
3. Add all environment variables from your `.env` file
4. **Important**: Update `BACKEND_URL` to your Railway URL (you'll get this after first deploy)

### 4.5 Deploy

```bash
railway up
```

Or connect to GitHub for automatic deployments:
1. Go to Railway Dashboard
2. Connect your GitHub repository
3. Every push to main will auto-deploy

### 4.6 Get Deployment URL

After deployment:
```bash
railway open
```

Or find it in Railway Dashboard.

### 4.7 Update Twilio Webhooks

Update your Twilio webhooks with your Railway URL:
- `https://your-app.railway.app/api/inbound-call`
- `https://your-app.railway.app/api/call-status`

### 4.8 Update Environment Variable

In Railway Dashboard, update:
```
BACKEND_URL=https://your-app.railway.app
```

## Step 5: Verification

### 5.1 Test Health Check

```bash
curl https://your-app.railway.app/health
```

### 5.2 Test Inbound Call

Call your Twilio number and verify the AI agent answers.

### 5.3 Test Outbound Call

Use the web dashboard to make an outbound call.

### 5.4 Check Database

In Supabase:
1. Go to Table Editor
2. Check `calls` and `leads` tables
3. Verify data is being logged

### 5.5 Verify Emails

1. Make a test call and provide an email address
2. Check that follow-up email is sent
3. Check that notification email is received

## Troubleshooting

### Backend won't start

- Check all environment variables are set
- Verify no port conflicts (kill other processes on port 8000)
- Check Node.js version: `node --version` (should be 18+)

### Twilio calls not working

- Verify webhook URLs are correct and use HTTPS
- Check Twilio console for error logs
- Ensure Media Streams is enabled
- Test health endpoint is accessible from internet

### Database errors

- Use `service_role` key, not `anon` key
- Verify schema is applied in Supabase SQL editor
- Check RLS policies

### Email not sending

- Verify domain is verified (Resend) or sender email approved (SendGrid)
- Check FROM_EMAIL matches verified domain
- Look for errors in backend logs

### WebSocket connection fails

- Check firewall settings
- Verify HTTPS is used in production
- Ensure backend URL is correctly configured

## Advanced Configuration

### Customize AI Agent

Edit `backend/openaiService.js`:
- Change voice: `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`
- Modify system instructions
- Adjust temperature and parameters

### Database Indexes

For better performance with large datasets, add custom indexes in Supabase.

### Rate Limiting

Consider adding rate limiting for production:
```bash
npm install express-rate-limit
```

### Monitoring

Set up monitoring:
- Railway metrics
- Supabase analytics
- Custom logging with Winston

## Next Steps

1. Customize the AI agent's personality and instructions
2. Add more lead qualification fields
3. Integrate with your CRM
4. Set up call recording storage
5. Add SMS follow-ups
6. Build custom analytics

## Support

If you encounter issues:
1. Check logs in Railway/local console
2. Review Twilio debugger logs
3. Check Supabase logs
4. Open an issue on GitHub

Happy calling! 📞🤖
