# 🤖 AI Phone Calling System

A production-ready AI phone calling system that handles both inbound and outbound sales calls using real-time voice AI. The system uses OpenAI's Realtime API to conduct natural conversations, automatically logs calls to Supabase, and sends follow-up emails via Resend or SendGrid.

## 🌟 Features

- **Real-time Voice AI Agent**: Powered by OpenAI Realtime API for natural conversations
- **Inbound & Outbound Calls**: Handle both incoming and outgoing phone calls via Twilio
- **Automatic Call Logging**: All calls are logged to Supabase with full transcripts
- **Lead Management**: Automatically captures and stores lead information
- **Email Automation**: Sends follow-up emails to leads and notifications to your team
- **Modern Dashboard**: Vue.js frontend with PrimeVue and Tailwind CSS
- **WebSocket Integration**: Real-time audio streaming between Twilio and OpenAI
- **Production Ready**: Configured for deployment on Railway

## 🏗️ Tech Stack

### Backend
- **Node.js** with Express
- **WebSocket** (ws) for real-time audio streaming
- **Twilio Voice API** with Media Streams
- **OpenAI Realtime API** for conversational AI
- **Supabase** for database and storage
- **Resend/SendGrid** for email services

### Frontend
- **Vue.js 3** with Composition API
- **PrimeVue** UI component library
- **Tailwind CSS** for styling
- **Pinia** for state management
- **Vite** for build tooling

### Deployment
- **Railway** for hosting
- **GitHub** for CI/CD

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Twilio account with a phone number
- An OpenAI API key with Realtime API access
- A Supabase project
- Either Resend or SendGrid API key
- Railway account (for deployment)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/cpetrula/bolt-ai.git
cd bolt-ai
```

### 2. Set Up Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key

# Email Service (choose one)
RESEND_API_KEY=your_resend_api_key
# OR
SENDGRID_API_KEY=your_sendgrid_api_key

# Email Configuration
FROM_EMAIL=noreply@yourdomain.com
NOTIFICATION_EMAIL=alerts@yourdomain.com

# Server Configuration
BACKEND_PORT=8000
FRONTEND_PORT=3000
BACKEND_URL=http://localhost:8000

# AI Agent Configuration
AI_AGENT_NAME=Jack
AI_AGENT_VOICE=alloy
```

### 3. Set Up Supabase Database

Run the SQL schema in your Supabase SQL editor:

```bash
cat backend/schema.sql
```

Copy and execute the contents in your Supabase project's SQL editor.

### 4. Install Dependencies

```bash
# Install all dependencies
npm run install:all

# Or install separately
npm run install:backend
npm run install:frontend
```

### 5. Run Locally

```bash
# Run both backend and frontend
npm run dev

# Or run separately
npm run dev:backend  # Backend on http://localhost:8000
npm run dev:frontend # Frontend on http://localhost:3000
```

### 6. Configure Twilio Webhooks

In your Twilio console, configure your phone number webhooks:

**Voice Configuration:**
- **A CALL COMES IN**: `https://your-domain.com/api/inbound-call` (HTTP POST)
- **STATUS CALLBACK URL**: `https://your-domain.com/api/call-status` (HTTP POST)

Replace `your-domain.com` with your Railway deployment URL or ngrok URL for local development.

## 🔧 Development

### Using ngrok for Local Development

To test Twilio webhooks locally, use ngrok:

```bash
ngrok http 8000
```

Update your Twilio webhook URLs with the ngrok URL.

### Project Structure

```
bolt-ai/
├── backend/
│   ├── server.js           # Main Express server
│   ├── config.js           # Configuration management
│   ├── database.js         # Supabase integration
│   ├── emailService.js     # Email service (Resend/SendGrid)
│   ├── twilioService.js    # Twilio API integration
│   ├── openaiService.js    # OpenAI Realtime API
│   ├── schema.sql          # Database schema
│   └── package.json        # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # Vue components
│   │   ├── views/          # Page views
│   │   ├── stores/         # Pinia stores
│   │   ├── services/       # API services
│   │   ├── router/         # Vue Router config
│   │   ├── App.vue         # Root component
│   │   └── main.js         # App entry point
│   ├── index.html
│   └── package.json        # Frontend dependencies
├── .env.example            # Environment template
├── package.json            # Root package file
└── railway.toml            # Railway config
```

## 🚢 Deployment to Railway

### 1. Connect to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link
```

### 2. Set Environment Variables

In Railway dashboard, add all environment variables from `.env.example`.

**Important**: Update `BACKEND_URL` to your Railway deployment URL.

### 3. Deploy

```bash
# Deploy via Railway CLI
railway up

# Or push to GitHub (if connected)
git push origin main
```

Railway will automatically:
- Install dependencies
- Build the application
- Start the server
- Provide a public URL

### 4. Update Twilio Webhooks

Update your Twilio webhook URLs with your Railway deployment URL:
- `https://your-railway-app.railway.app/api/inbound-call`
- `https://your-railway-app.railway.app/api/call-status`

## 📱 Usage

### Making Outbound Calls

1. Open the dashboard at `http://localhost:3000` (or your deployment URL)
2. Enter a phone number in the "Make Outbound Call" section
3. Click "Call" to initiate the call
4. The AI agent will introduce itself and begin the conversation

### Receiving Inbound Calls

1. Call your Twilio phone number
2. The AI agent will answer and greet the caller
3. Conversation is handled automatically
4. Lead information is captured and stored

### Viewing Call History

- Navigate to the "Calls" page to view all call history
- Click "View" on any call to see full details and transcript

### Managing Leads

- Navigate to the "Leads" page to view captured leads
- Click "View Notes" to see conversation details
- Leads automatically receive follow-up emails

## 🎯 AI Agent Capabilities

The AI agent is configured to:

1. **Engage Naturally**: Warm, conversational tone
2. **Qualify Leads**: Collect name, email, phone, business type
3. **Validate Information**: Confirm spelling and details
4. **Handle Objections**: Gracefully handle busy/uninterested prospects
5. **Close Professionally**: Thank callers and mention follow-up email

### Customizing the AI Agent

Edit `backend/openaiService.js` to customize:
- Agent name
- Voice (alloy, echo, fable, onyx, nova, shimmer)
- System instructions
- Conversation flow

## 🔐 Security Best Practices

1. **Never commit `.env` file**: Always use `.env.example` as template
2. **Use service role key**: For Supabase backend access
3. **Enable RLS**: Row Level Security policies are included in schema
4. **Rotate API keys**: Regularly update all API keys
5. **Use HTTPS**: Always use HTTPS in production
6. **Validate webhooks**: Twilio request validation is recommended

## 🧪 Testing

### Test Endpoints

```bash
# Health check
curl http://localhost:8000/health

# Get calls
curl http://localhost:8000/api/calls

# Get leads
curl http://localhost:8000/api/leads

# Make outbound call
curl -X POST http://localhost:8000/api/outbound-call \
  -H "Content-Type: application/json" \
  -d '{"to_number": "+1234567890"}'
```

## 📊 Monitoring

- **Health Check**: `/health` endpoint shows service status
- **Active Calls**: `/api/active-calls` shows currently active calls
- **Logs**: Check Railway logs for debugging
- **Supabase**: Monitor database queries and usage

## 🐛 Troubleshooting

### Common Issues

**Audio not streaming:**
- Check WebSocket connection in browser console
- Verify Twilio Media Streams is enabled
- Check firewall settings

**Calls not connecting:**
- Verify Twilio webhook URLs are correct
- Check backend logs for errors
- Ensure BACKEND_URL is set correctly

**Database errors:**
- Verify Supabase credentials
- Check RLS policies
- Ensure schema is applied

**Email not sending:**
- Verify email service API key
- Check FROM_EMAIL domain verification
- Review email service logs

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for Realtime API
- Twilio for Voice and Media Streams
- Supabase for database services
- Railway for hosting platform

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review Railway and Twilio logs

## 🗺️ Roadmap

- [ ] Call recording storage
- [ ] Advanced lead scoring
- [ ] CRM integrations
- [ ] SMS follow-ups
- [ ] Multi-language support
- [ ] Call analytics dashboard
- [ ] A/B testing for scripts
- [ ] Appointment scheduling

---

Built with ❤️ using Node.js, Vue.js, OpenAI, and Twilio
