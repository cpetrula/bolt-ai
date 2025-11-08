import twilio from 'twilio';
import { config } from './config.js';

const { VoiceResponse } = twilio.twiml;

class TwilioService {
  constructor() {
    this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
    this.phoneNumber = config.twilio.phoneNumber;
  }

  generateTwimlForStream(streamUrl) {
    const response = new VoiceResponse();
    response.say(
      `Hello, this is ${config.agent.name}. Please hold while I connect you.`
    );

    const connect = response.connect();
    connect.stream({ url: streamUrl });

    return response.toString();
  }

  generateTwimlForInbound() {
    const response = new VoiceResponse();
    response.say(
      `Hello, thank you for calling. This is ${config.agent.name}. Connecting you now.`
    );

    const connect = response.connect();
    connect.stream({ url: `${config.server.backendUrl}/media-stream` });

    return response.toString();
  }

  async makeOutboundCall(toNumber, webhookUrl) {
    try {
      const call = await this.client.calls.create({
        to: toNumber,
        from: this.phoneNumber,
        url: webhookUrl,
        statusCallback: `${config.server.backendUrl}/api/call-status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST',
      });

      console.log(`Outbound call initiated: ${call.sid} to ${toNumber}`);
      return {
        call_sid: call.sid,
        status: call.status,
        to: toNumber,
        from: this.phoneNumber,
      };
    } catch (error) {
      console.error('Error making outbound call:', error.message);
      return null;
    }
  }

  async getCallDetails(callSid) {
    try {
      const call = await this.client.calls(callSid).fetch();
      return {
        call_sid: call.sid,
        status: call.status,
        duration: call.duration,
        from: call.from,
        to: call.to,
        start_time: call.startTime,
        end_time: call.endTime,
      };
    } catch (error) {
      console.error('Error fetching call details:', error.message);
      return null;
    }
  }
}

export const twilioService = new TwilioService();
