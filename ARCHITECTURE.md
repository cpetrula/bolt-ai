# AI Phone Calling System - Architecture Overview

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PHONE CALL FLOW                              │
└─────────────────────────────────────────────────────────────────────┘

    Inbound Call                                    Outbound Call
         │                                                 │
         ▼                                                 ▼
    ┌─────────┐                                      ┌─────────┐
    │ Twilio  │◄────────────────────────────────────►│ Twilio  │
    │  Voice  │      Voice API (REST)                │  Voice  │
    └────┬────┘                                      └────┬────┘
         │                                                 │
         │ Media Stream (WebSocket - Audio)               │
         │                                                 │
         ▼                                                 ▼
    ┌────────────────────────────────────────────────────────┐
    │              Express Server (Node.js)                  │
    │  ┌──────────────────────────────────────────────────┐ │
    │  │  WebSocket Handler (/media-stream)               │ │
    │  │  • Receives audio from Twilio                    │ │
    │  │  • Forwards to OpenAI                            │ │
    │  │  • Streams AI responses back to Twilio           │ │
    │  └──────────────────────────────────────────────────┘ │
    └────┬─────────────────────────────────────────────┬───┘
         │                                              │
         │ Audio Chunks                                 │
         ▼                                              ▼
    ┌─────────────┐                            ┌──────────────┐
    │   OpenAI    │                            │   Services   │
    │  Realtime   │                            │              │
    │     API     │                            │  • Twilio    │
    │             │                            │  • Supabase  │
    │ • Process   │                            │  • Email     │
    │   Audio     │                            │              │
    │ • Generate  │                            └──────┬───────┘
    │   Response  │                                   │
    │ • Extract   │                                   │
    │   Transcript│                                   ▼
    └─────┬───────┘                         ┌─────────────────┐
          │                                 │   Supabase DB   │
          │ AI Response                     │  ┌────────────┐ │
          │                                 │  │   Calls    │ │
          └────────────────────────────────►│  │   Table    │ │
                                            │  └────────────┘ │
                                            │  ┌────────────┐ │
                                            │  │   Leads    │ │
                                            │  │   Table    │ │
                                            │  └────────────┘ │
                                            └─────────────────┘
                                                     │
                                                     │ Lead Data
                                                     ▼
                                            ┌─────────────────┐
                                            │ Email Service   │
                                            │                 │
                                            │ • Follow-up to  │
                                            │   Lead          │
                                            │ • Notification  │
                                            │   to Team       │
                                            └─────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND DASHBOARD                            │
└─────────────────────────────────────────────────────────────────────┘

    ┌────────────────────────────────────────────────────────┐
    │              Vue.js Application (Port 3000)             │
    │                                                         │
    │  ┌────────────┐  ┌────────────┐  ┌────────────┐      │
    │  │ Dashboard  │  │   Calls    │  │   Leads    │      │
    │  │            │  │            │  │            │      │
    │  │ • Stats    │  │ • History  │  │ • List     │      │
    │  │ • Make Call│  │ • Details  │  │ • Details  │      │
    │  │ • Activity │  │ • Filters  │  │ • Notes    │      │
    │  └────────────┘  └────────────┘  └────────────┘      │
    │                                                         │
    │  ┌──────────────────────────────────────────────────┐ │
    │  │         API Service (Axios)                      │ │
    │  │  • GET /api/calls                                │ │
    │  │  • GET /api/leads                                │ │
    │  │  • POST /api/outbound-call                       │ │
    │  │  • GET /api/active-calls                         │ │
    │  └──────────────────────────────────────────────────┘ │
    └────────────────────┬───────────────────────────────────┘
                         │
                         │ HTTP/REST API
                         ▼
                ┌─────────────────┐
                │ Express Server  │
                │   (Port 8000)   │
                └─────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Backend Services                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐
│  server.js   │  Main Express application
│              │  • REST API endpoints
│              │  • WebSocket handler
│              │  • Request routing
└──────┬───────┘
       │
       ├──► ┌──────────────┐
       │    │  config.js   │  Environment configuration
       │    └──────────────┘
       │
       ├──► ┌─────────────────┐
       │    │ openaiService   │  OpenAI Realtime API client
       │    │                 │  • Create session
       │    │                 │  • Send/receive audio
       │    │                 │  • System instructions
       │    └─────────────────┘
       │
       ├──► ┌─────────────────┐
       │    │ twilioService   │  Twilio Voice API wrapper
       │    │                 │  • Generate TwiML
       │    │                 │  • Make calls
       │    │                 │  • Get call details
       │    └─────────────────┘
       │
       ├──► ┌─────────────────┐
       │    │ database.js     │  Supabase client
       │    │                 │  • Log calls
       │    │                 │  • Create leads
       │    │                 │  • Query data
       │    └─────────────────┘
       │
       └──► ┌─────────────────┐
            │ emailService    │  Email sender
            │                 │  • Resend/SendGrid
            │                 │  • Follow-ups
            │                 │  • Notifications
            └─────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                    Frontend Structure                        │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐
│   main.js    │  Application entry point
│              │  • Create Vue app
│              │  • Setup plugins
│              │  • Mount app
└──────┬───────┘
       │
       ├──► ┌──────────────┐
       │    │   router/    │  Vue Router configuration
       │    │              │  • Route definitions
       │    │              │  • Navigation guards
       │    └──────────────┘
       │
       ├──► ┌──────────────┐
       │    │   stores/    │  Pinia state management
       │    │              │  • calls.js (state + actions)
       │    │              │  • Global state
       │    └──────────────┘
       │
       ├──► ┌──────────────┐
       │    │  services/   │  API client
       │    │              │  • api.js (axios wrapper)
       │    │              │  • HTTP requests
       │    └──────────────┘
       │
       └──► ┌──────────────┐
            │   views/     │  Page components
            │              │  • Dashboard.vue
            │              │  • Calls.vue
            │              │  • Leads.vue
            └──────────────┘
```

## Data Flow

```
┌────────────────────────────────────────────────────────────────┐
│                   Call Processing Flow                          │
└────────────────────────────────────────────────────────────────┘

1. Call Initiated
   ├─► Twilio Voice API (REST)
   ├─► POST /api/inbound-call OR /api/outbound-call-webhook
   └─► Return TwiML with Media Stream URL

2. Media Stream Connected
   ├─► WebSocket /media-stream established
   ├─► OpenAI Realtime session created
   └─► Start bidirectional audio streaming

3. Conversation Loop
   ├─► User speaks → Twilio → Server → OpenAI
   ├─► OpenAI processes → Generates response
   ├─► OpenAI → Server → Twilio → User hears AI
   └─► Transcripts collected in real-time

4. Lead Extraction
   ├─► Parse user transcripts
   ├─► Extract: name, email, phone, business type
   └─► Store in memory during call

5. Call Ends
   ├─► WebSocket closed
   ├─► Save transcript to database
   ├─► Create lead record if data collected
   ├─► Send notification email to team
   ├─► Send follow-up email to lead
   └─► Update dashboard

6. Dashboard Updates
   ├─► Frontend polls /api/calls
   ├─► Frontend polls /api/leads
   └─► Display updated data
```

## Technology Stack Details

```
Backend:
├─ Node.js 18+          Runtime environment
├─ Express 4.x          Web framework
├─ ws 8.17.1           WebSocket library
├─ Twilio SDK          Voice API client
├─ OpenAI SDK          Realtime API client
├─ Supabase-js         Database client
├─ Resend/SendGrid     Email services
└─ dotenv              Environment config

Frontend:
├─ Vue.js 3.x          Progressive framework
├─ Vite 5.x            Build tool
├─ PrimeVue 3.x        UI components
├─ Tailwind CSS 3.x    Utility-first CSS
├─ Pinia 2.x           State management
├─ Vue Router 4.x      Routing
└─ Axios               HTTP client

Database:
├─ Supabase            Hosted PostgreSQL
├─ PostgreSQL 15+      Database engine
└─ RLS Policies        Row Level Security

Infrastructure:
├─ Railway             Hosting platform
├─ GitHub              Version control & CI/CD
└─ ngrok               Local webhook tunneling
```

## Security & Best Practices

```
Security Layers:
├─ Environment Variables    Sensitive data isolation
├─ RLS Policies            Database access control
├─ HTTPS                   Encrypted communication
├─ Service Role Key        Backend authentication
├─ API Key Rotation        Regular security updates
└─ Input Validation        Prevent injection attacks

Code Quality:
├─ ES6+ Modules           Modern JavaScript
├─ Async/Await            Clean async code
├─ Error Handling         Try/catch blocks
├─ Logging               Console + production logs
└─ Code Comments          Documentation
```

## Deployment Pipeline

```
Development:
  Local Machine
      ↓
  npm install
      ↓
  npm run dev
      ↓
  ngrok tunnel
      ↓
  Test with Twilio

Staging/Production:
  GitHub Push
      ↓
  Railway CI/CD
      ↓
  npm install
      ↓
  npm start
      ↓
  Health Check
      ↓
  Update Twilio Webhooks
      ↓
  Production Ready
```

## Monitoring & Observability

```
Logs:
├─ Railway Logs         Application logs
├─ Twilio Debugger      Call logs & errors
├─ Supabase Logs        Database queries
└─ Console Logs         Development debugging

Metrics:
├─ Active Calls         Real-time count
├─ Call Duration        Average & total
├─ Lead Conversion      Success rate
├─ API Response Time    Performance
└─ Error Rate          System health
```

---

This architecture provides:
✅ Scalability: Handle multiple concurrent calls
✅ Reliability: Error handling and logging
✅ Security: Environment-based configuration
✅ Maintainability: Modular service design
✅ Extensibility: Easy to add new features
