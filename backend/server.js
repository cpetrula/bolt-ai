import express from 'express';
import expressWs from 'express-ws';
import cors from 'cors';
import bodyParser from 'body-parser';
import { config } from './config.js';
import { dbService } from './database.js';
import { emailService } from './emailService.js';
import { twilioService } from './twilioService.js';
import { openaiService } from './openaiService.js';

const app = express();
expressWs(app);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Store active call sessions
const activeSessions = new Map();

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AI Phone Calling System',
    version: '1.0.0',
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      openai: !!config.openai.apiKey,
      twilio: !!config.twilio.accountSid,
      supabase: !!config.supabase.url,
      email: !!(config.email.resendApiKey || config.email.sendgridApiKey),
    },
  });
});

// Handle incoming Twilio calls
app.post('/api/inbound-call', async (req, res) => {
  const { CallSid, From, To } = req.body;

  console.log(`Inbound call received: ${CallSid} from ${From}`);

  // Log call to database
  await dbService.logCall({
    call_sid: CallSid,
    direction: 'inbound',
    from_number: From,
    to_number: To,
    status: 'initiated',
  });

  // Generate TwiML to connect to WebSocket
  const twiml = twilioService.generateTwimlForInbound();

  res.type('text/xml');
  res.send(twiml);
});

// Initiate an outbound call
app.post('/api/outbound-call', async (req, res) => {
  try {
    const { to_number, metadata } = req.body;

    if (!to_number) {
      return res.status(400).json({ error: 'to_number is required' });
    }

    const webhookUrl = `${config.server.backendUrl}/api/outbound-call-webhook`;

    const callData = await twilioService.makeOutboundCall(to_number, webhookUrl);

    if (!callData) {
      return res.status(500).json({ error: 'Failed to initiate call' });
    }

    // Log call to database
    await dbService.logCall({
      call_sid: callData.call_sid,
      direction: 'outbound',
      from_number: callData.from,
      to_number: callData.to,
      status: 'initiated',
      metadata: metadata || {},
    });

    res.json({
      success: true,
      call_sid: callData.call_sid,
      status: callData.status,
    });
  } catch (error) {
    console.error('Error making outbound call:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook for outbound call TwiML
app.post('/api/outbound-call-webhook', (req, res) => {
  const { CallSid } = req.body;

  console.log(`Outbound call webhook: ${CallSid}`);

  // Generate TwiML to connect to WebSocket
  const twiml = twilioService.generateTwimlForInbound();

  res.type('text/xml');
  res.send(twiml);
});

// Handle Twilio call status callbacks
app.post('/api/call-status', async (req, res) => {
  const { CallSid, CallStatus, CallDuration } = req.body;

  console.log(`Call status update: ${CallSid} - ${CallStatus}`);

  // Update call in database
  const updates = {
    status: CallStatus,
    duration: parseInt(CallDuration) || 0,
  };

  if (CallStatus === 'completed') {
    updates.ended_at = new Date().toISOString();
  }

  await dbService.updateCall(CallSid, updates);

  res.json({ success: true });
});

// WebSocket endpoint for Twilio Media Streams
app.ws('/media-stream', async (ws, req) => {
  console.log('Media stream WebSocket connected');

  let callSid = null;
  let streamSid = null;
  let openaiWs = null;
  const transcript = [];
  const leadData = {};

  try {
    // Create OpenAI Realtime session
    openaiWs = await openaiService.createSession();

    if (!openaiWs) {
      console.error('Failed to create OpenAI session');
      ws.close();
      return;
    }

    // Handle messages from OpenAI
    openaiWs.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        const eventType = data.type;

        if (eventType === 'response.audio.delta') {
          // Send audio back to Twilio
          const audioData = data.delta;
          if (audioData && streamSid) {
            const mediaMessage = {
              event: 'media',
              streamSid: streamSid,
              media: {
                payload: audioData,
              },
            };
            ws.send(JSON.stringify(mediaMessage));
          }
        } else if (eventType === 'response.audio_transcript.done') {
          // Log AI response transcript
          const text = data.transcript || '';
          transcript.push({ role: 'assistant', text });
          console.log(`AI: ${text}`);
        } else if (
          eventType === 'conversation.item.input_audio_transcription.completed'
        ) {
          // Log user speech transcript
          const text = data.transcript || '';
          transcript.push({ role: 'user', text });
          console.log(`User: ${text}`);

          // Extract lead info from conversation
          extractLeadInfo(text, leadData);
        }
      } catch (error) {
        console.error('Error processing OpenAI message:', error);
      }
    });

    openaiWs.on('error', (error) => {
      console.error('OpenAI WebSocket error:', error);
    });

    openaiWs.on('close', () => {
      console.log('OpenAI WebSocket closed');
    });

    // Handle messages from Twilio
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        const event = data.event;

        if (event === 'start') {
          streamSid = data.start.streamSid;
          callSid = data.start.callSid;
          console.log(`Stream started: ${streamSid}, Call: ${callSid}`);

          // Store session
          activeSessions.set(callSid, {
            streamSid,
            startedAt: new Date().toISOString(),
            transcript,
            leadData,
          });
        } else if (event === 'media') {
          // Forward audio to OpenAI
          if (openaiWs && openaiWs.readyState === 1) {
            const audioPayload = data.media.payload;
            const audioBytes = Buffer.from(audioPayload, 'base64');
            openaiService.sendAudio(openaiWs, audioBytes);
          }
        } else if (event === 'stop') {
          console.log(`Stream stopped: ${streamSid}`);

          // Process end of call
          if (callSid) {
            await processCallCompletion(callSid, transcript, leadData);

            // Clean up session
            activeSessions.delete(callSid);
          }
        }
      } catch (error) {
        console.error('Error processing Twilio message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Media stream WebSocket disconnected');
      if (openaiWs) {
        openaiWs.close();
      }
      if (callSid) {
        activeSessions.delete(callSid);
      }
    });

    ws.on('error', (error) => {
      console.error('Media stream WebSocket error:', error);
    });
  } catch (error) {
    console.error('Error in media stream handler:', error);
    ws.close();
  }
});

// Helper function to extract lead info from conversation
function extractLeadInfo(text, leadData) {
  const textLower = text.toLowerCase();

  // Simple extraction logic (can be enhanced with NLP)
  if (text.includes('@') && !leadData.email) {
    // Extract email
    const words = text.split(/\s+/);
    for (const word of words) {
      if (word.includes('@')) {
        leadData.email = word.replace(/[.,!?;]+$/, '');
        break;
      }
    }
  }

  // More sophisticated extraction would use NLP or structured output from OpenAI
}

// Process call completion
async function processCallCompletion(callSid, transcript, leadData) {
  try {
    // Update call with transcript
    const transcriptText = transcript
      .map((t) => `${t.role}: ${t.text}`)
      .join('\n');

    await dbService.updateCall(callSid, {
      transcript: transcriptText,
      status: 'completed',
    });

    // If we have lead data, create lead and send emails
    if (leadData.email || leadData.name) {
      leadData.call_sid = callSid;
      leadData.notes = transcriptText;

      // Create lead in database
      const lead = await dbService.createLead(leadData);

      if (lead) {
        // Send notification email
        await emailService.sendLeadNotification(leadData);

        // Send follow-up email to lead
        if (leadData.email) {
          await emailService.sendFollowupEmail(leadData.email, leadData);
        }
      }
    }

    console.log(`Call completed and processed: ${callSid}`);
  } catch (error) {
    console.error('Error processing call completion:', error);
  }
}

// Get recent calls
app.get('/api/calls', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const calls = await dbService.getCalls(limit, offset);

    res.json({
      calls,
      count: calls.length,
    });
  } catch (error) {
    console.error('Error fetching calls:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get recent leads
app.get('/api/leads', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const leads = await dbService.getLeads(limit, offset);

    res.json({
      leads,
      count: leads.length,
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get currently active calls
app.get('/api/active-calls', (req, res) => {
  res.json({
    active_calls: Array.from(activeSessions.keys()),
    count: activeSessions.size,
  });
});

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`AI Phone Calling System Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
