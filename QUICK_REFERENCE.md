# Quick Reference Guide

## Environment Variables

```bash
# Required
OPENAI_API_KEY=           # OpenAI API key for Realtime API
TWILIO_ACCOUNT_SID=       # Twilio Account SID
TWILIO_AUTH_TOKEN=        # Twilio Auth Token
TWILIO_PHONE_NUMBER=      # Your Twilio phone number (+1234567890)
SUPABASE_URL=             # Supabase project URL
SUPABASE_KEY=             # Supabase service role key

# Email (choose one)
RESEND_API_KEY=           # Resend API key (recommended)
SENDGRID_API_KEY=         # Or SendGrid API key

# Email Config
FROM_EMAIL=               # Sender email address
NOTIFICATION_EMAIL=       # Where to send lead notifications

# Server
BACKEND_PORT=8000         # Backend port (default: 8000)
FRONTEND_PORT=3000        # Frontend port (default: 3000)
BACKEND_URL=              # Full backend URL (e.g., https://your-app.railway.app)

# AI Agent
AI_AGENT_NAME=Jack        # Agent name (default: Jack)
AI_AGENT_VOICE=alloy      # OpenAI voice (alloy, echo, fable, onyx, nova, shimmer)
```

## API Endpoints

### Health Check
```bash
GET /health
GET /
```

### Call Management
```bash
# Inbound call webhook (Twilio)
POST /api/inbound-call

# Outbound call webhook (Twilio)
POST /api/outbound-call-webhook

# Make outbound call
POST /api/outbound-call
Body: { "to_number": "+1234567890", "metadata": {} }

# Call status callback (Twilio)
POST /api/call-status

# Get call history
GET /api/calls?limit=50&offset=0

# Get active calls
GET /api/active-calls
```

### Lead Management
```bash
# Get leads
GET /api/leads?limit=50&offset=0
```

### WebSocket
```
WS /media-stream  # Twilio Media Stream connection
```

## Commands

### Development
```bash
# Install all dependencies
npm run install:all

# Run backend only
npm run dev:backend

# Run frontend only
npm run dev:frontend

# Run both (requires concurrently)
npm run dev

# Build frontend
cd frontend && npm run build
```

### Production
```bash
# Start backend server
npm start

# Or
cd backend && npm start
```

### Testing
```bash
# Check syntax
cd backend && node --check *.js

# Test health endpoint
curl http://localhost:8000/health

# Test with ngrok (for local Twilio webhooks)
ngrok http 8000
```

## Database Schema

### Calls Table
- `id` (UUID, PK)
- `call_sid` (VARCHAR, unique)
- `direction` (VARCHAR: inbound/outbound)
- `from_number` (VARCHAR)
- `to_number` (VARCHAR)
- `status` (VARCHAR)
- `started_at` (TIMESTAMP)
- `ended_at` (TIMESTAMP)
- `duration` (INTEGER, seconds)
- `transcript` (TEXT)
- `metadata` (JSONB)

### Leads Table
- `id` (UUID, PK)
- `name` (VARCHAR)
- `email` (VARCHAR)
- `phone` (VARCHAR)
- `business_type` (VARCHAR)
- `call_sid` (VARCHAR, FK)
- `status` (VARCHAR: new/contacted/qualified/converted)
- `notes` (TEXT)
- `metadata` (JSONB)

## Twilio Configuration

### Phone Number Webhooks

**Voice Configuration:**
- A CALL COMES IN: `https://your-domain/api/inbound-call` (POST)
- STATUS CALLBACK URL: `https://your-domain/api/call-status` (POST)

**Required Capabilities:**
- Voice
- Media Streams (WebSocket support)

## OpenAI Voices

Available voices for AI agent:
- `alloy` - Neutral, balanced
- `echo` - Clear, warm
- `fable` - Expressive, engaging
- `onyx` - Deep, authoritative
- `nova` - Warm, friendly
- `shimmer` - Bright, energetic

## Common Issues

### Port Already in Use
```bash
# Find process on port 8000
lsof -ti:8000

# Kill process
kill -9 $(lsof -ti:8000)
```

### WebSocket Connection Failed
- Ensure HTTPS in production
- Check firewall settings
- Verify backend URL is correct
- Test health endpoint accessibility

### No Audio in Calls
- Verify Twilio Media Streams is enabled
- Check WebSocket connection logs
- Ensure OpenAI API key has Realtime access
- Test ngrok tunnel is active (local dev)

### Database Errors
- Use service_role key, not anon key
- Verify schema is applied
- Check RLS policies
- Ensure tables exist

### Email Not Sending
- Verify domain/email is verified
- Check API key permissions
- Review backend logs for errors
- Test with a simple curl request

## File Structure

```
bolt-ai/
├── backend/
│   ├── server.js           # Main Express server + WebSocket handler
│   ├── config.js           # Environment configuration
│   ├── database.js         # Supabase client + methods
│   ├── emailService.js     # Email sender (Resend/SendGrid)
│   ├── twilioService.js    # Twilio API wrapper
│   ├── openaiService.js    # OpenAI Realtime API client
│   ├── schema.sql          # Database schema
│   └── package.json        # Backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── views/          # Dashboard, Calls, Leads pages
│   │   ├── stores/         # Pinia state management
│   │   ├── services/       # API client
│   │   ├── router/         # Vue Router
│   │   ├── App.vue         # Root component
│   │   └── main.js         # Entry point
│   └── package.json        # Frontend dependencies
│
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
├── package.json            # Root package (scripts)
├── railway.toml            # Railway deployment config
├── README.md               # Full documentation
└── SETUP.md                # Setup guide
```

## Deployment Checklist

- [ ] All environment variables set in Railway
- [ ] Database schema applied in Supabase
- [ ] Domain/email verified (Resend/SendGrid)
- [ ] Twilio webhooks updated with Railway URL
- [ ] BACKEND_URL points to Railway deployment
- [ ] Test health endpoint
- [ ] Test inbound call
- [ ] Test outbound call
- [ ] Verify database logging
- [ ] Confirm emails are sent

## Development Workflow

1. **Make changes** to backend or frontend
2. **Test locally** with ngrok for Twilio webhooks
3. **Commit changes** to Git
4. **Push to GitHub** (triggers Railway auto-deploy if connected)
5. **Update Twilio** webhooks if backend URL changed
6. **Test production** deployment

## Monitoring

### Logs
```bash
# Railway logs
railway logs

# Local backend logs
# Shown in terminal where you ran npm start

# Twilio logs
# Check Twilio Console → Monitor → Logs → Errors
```

### Metrics
- Railway: CPU, Memory, Network usage
- Supabase: Database size, Query performance
- Twilio: Call volume, Duration, Errors

## Support Resources

- **OpenAI Docs**: https://platform.openai.com/docs/guides/realtime
- **Twilio Docs**: https://www.twilio.com/docs/voice/media-streams
- **Supabase Docs**: https://supabase.com/docs
- **Railway Docs**: https://docs.railway.app
- **Vue.js Docs**: https://vuejs.org
- **PrimeVue Docs**: https://primevue.org

## Security Notes

- Never commit `.env` file
- Use service role key for backend Supabase access
- Enable RLS policies in production
- Rotate API keys regularly
- Use HTTPS in production
- Validate Twilio webhook signatures (recommended)
- Keep dependencies updated
- Review security logs regularly

## Performance Tips

- Use connection pooling for database
- Implement caching for frequent queries
- Add rate limiting for API endpoints
- Optimize WebSocket message size
- Monitor audio quality and latency
- Use CDN for frontend assets
- Enable gzip compression
- Set up database indexes for large datasets
