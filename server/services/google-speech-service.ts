import { Readable } from 'stream';

interface SpeechRecognitionConfig {
  encoding: string;
  sampleRateHertz: number;
  languageCode: string;
  maxAlternatives: number;
  enableAutomaticPunctuation: boolean;
}

interface RecognitionAudio {
  content: string;
}

interface SpeechRecognitionRequest {
  config: SpeechRecognitionConfig;
  audio: RecognitionAudio;
}

interface SpeechRecognitionResponse {
  results: Array<{
    alternatives: Array<{
      transcript: string;
      confidence: number;
    }>;
  }>;
}

export class GoogleSpeechService {
  private apiKey: string;
  private apiUrl = 'https://speech.googleapis.com/v1/speech:recognize';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    try {
      // Convert audio buffer to base64
      const audioContent = audioBuffer.toString('base64');

      const request: SpeechRecognitionRequest = {
        config: {
          encoding: 'WEBM_OPUS', // Common format for web audio recording
          sampleRateHertz: 48000,
          languageCode: 'en-US',
          maxAlternatives: 1,
          enableAutomaticPunctuation: true,
        },
        audio: {
          content: audioContent,
        },
      };

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Speech API error: ${response.status} ${errorText}`);
      }

      const result: SpeechRecognitionResponse = await response.json();

      if (result.results && result.results.length > 0) {
        const transcript = result.results[0].alternatives[0].transcript;
        return transcript.trim();
      }

      throw new Error('No transcription results returned');
    } catch (error) {
      console.error('Speech transcription error:', error);
      throw error;
    }
  }
}

// Initialize service with API key
const googleSpeechService = process.env.GOOGLE_SPEECH_API_KEY 
  ? new GoogleSpeechService(process.env.GOOGLE_SPEECH_API_KEY)
  : null;

export { googleSpeechService };