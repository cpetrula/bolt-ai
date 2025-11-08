import WebSocket from 'ws';
import { config } from './config.js';

class OpenAIRealtimeService {
  constructor() {
    this.apiKey = config.openai.apiKey;
    this.wsUrl = 'wss://api.openai.com/v1/realtime';
    this.model = 'gpt-4o-realtime-preview-2024-10-01';
    this.voice = config.agent.voice;
    this.agentName = config.agent.name;
  }

  async createSession() {
    try {
      const url = `${this.wsUrl}?model=${this.model}`;
      const headers = {
        Authorization: `Bearer ${this.apiKey}`,
        'OpenAI-Beta': 'realtime=v1',
      };

      const ws = new WebSocket(url, { headers });

      return new Promise((resolve, reject) => {
        ws.on('open', () => {
          console.log('OpenAI Realtime session opened');

          // Configure session
          const sessionConfig = {
            type: 'session.update',
            session: {
              modalities: ['text', 'audio'],
              instructions: this.getSystemInstructions(),
              voice: this.voice,
              input_audio_format: 'pcm16',
              output_audio_format: 'pcm16',
              input_audio_transcription: {
                model: 'whisper-1',
              },
              turn_detection: {
                type: 'server_vad',
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 500,
              },
              tools: [],
              tool_choice: 'auto',
              temperature: 0.8,
              max_response_output_tokens: 4096,
            },
          };

          ws.send(JSON.stringify(sessionConfig));
          resolve(ws);
        });

        ws.on('error', (error) => {
          console.error('OpenAI WebSocket error:', error);
          reject(error);
        });
      });
    } catch (error) {
      console.error('Error creating OpenAI session:', error.message);
      return null;
    }
  }

  getSystemInstructions() {
    return `You are ${this.agentName}, a friendly and professional AI sales agent. Your role is to:

1. **Engage naturally**: Have a warm, conversational tone. Ask open-ended questions and show genuine interest.

2. **Qualify leads**: During the conversation, collect:
   - Full name
   - Business type/industry
   - Email address
   - Any specific needs or pain points

3. **Validate information**: 
   - Confirm spelling of names and email addresses
   - Repeat back important information for verification

4. **Handle objections gracefully**: If someone is busy or not interested, thank them politely and offer to call back later.

5. **Be concise**: Keep your responses brief (2-3 sentences max) to maintain natural conversation flow.

6. **Close professionally**: Thank them for their time and let them know they'll receive a follow-up email.

7. **Extract structured data**: When you've collected all information, you'll need to format it for the system.

Remember: You're helpful, not pushy. Focus on understanding their needs rather than just making a sale.

For outbound calls: Introduce yourself, ask if it's a good time to talk, then proceed with qualification.
For inbound calls: Thank them for calling, ask how you can help, then proceed with qualification.`;
  }

  sendAudio(ws, audioData) {
    try {
      // Audio data should be base64 encoded
      const audioBase64 = audioData.toString('base64');

      const message = {
        type: 'input_audio_buffer.append',
        audio: audioBase64,
      };

      ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending audio to OpenAI:', error.message);
    }
  }

  commitAudio(ws) {
    try {
      const message = {
        type: 'input_audio_buffer.commit',
      };
      ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error committing audio:', error.message);
    }
  }

  sendText(ws, text) {
    try {
      const message = {
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: text,
            },
          ],
        },
      };

      ws.send(JSON.stringify(message));

      // Trigger response
      const responseMessage = {
        type: 'response.create',
      };
      ws.send(JSON.stringify(responseMessage));
    } catch (error) {
      console.error('Error sending text to OpenAI:', error.message);
    }
  }
}

export const openaiService = new OpenAIRealtimeService();
