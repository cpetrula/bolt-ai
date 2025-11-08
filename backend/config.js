import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  
  // Twilio Configuration
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
  
  // Supabase Configuration
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
  },
  
  // Email Service Configuration
  email: {
    resendApiKey: process.env.RESEND_API_KEY,
    sendgridApiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.FROM_EMAIL || 'noreply@example.com',
    notificationEmail: process.env.NOTIFICATION_EMAIL || 'alerts@example.com',
  },
  
  // Server Configuration
  server: {
    port: parseInt(process.env.BACKEND_PORT || '8000'),
    frontendPort: parseInt(process.env.FRONTEND_PORT || '3000'),
    backendUrl: process.env.BACKEND_URL || 'http://localhost:8000',
  },
  
  // AI Agent Configuration
  agent: {
    name: process.env.AI_AGENT_NAME || 'Jack',
    voice: process.env.AI_AGENT_VOICE || 'alloy',
  },
};
