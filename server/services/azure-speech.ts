import * as speechSdk from "microsoft-cognitiveservices-speech-sdk";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

export interface SpeechConfig {
  subscriptionKey: string;
  serviceRegion: string;
}

export class AzureSpeechService {
  private speechConfig: speechSdk.SpeechConfig;

  constructor(config: SpeechConfig) {
    this.speechConfig = speechSdk.SpeechConfig.fromSubscription(
      config.subscriptionKey,
      config.serviceRegion
    );
    
    // Use a clear, natural voice
    this.speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";
    this.speechConfig.speechSynthesisOutputFormat = speechSdk.SpeechSynthesisOutputFormat.Audio48Khz96KBitRateMonoMp3;
  }

  async generateAudio(text: string, outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Ensure the audio directory exists
      const audioDir = join(process.cwd(), "dist", "audio");
      if (!existsSync(audioDir)) {
        mkdirSync(audioDir, { recursive: true });
      }

      const fullOutputPath = join(audioDir, outputPath);
      const audioConfig = speechSdk.AudioConfig.fromAudioFileOutput(fullOutputPath);
      
      const synthesizer = new speechSdk.SpeechSynthesizer(this.speechConfig, audioConfig);

      synthesizer.speakTextAsync(
        text,
        (result) => {
          if (result.reason === speechSdk.ResultReason.SynthesizingAudioCompleted) {
            synthesizer.close();
            resolve(fullOutputPath);
          } else {
            synthesizer.close();
            reject(new Error(`Speech synthesis failed: ${result.errorDetails}`));
          }
        },
        (error) => {
          synthesizer.close();
          reject(new Error(`Speech synthesis error: ${error}`));
        }
      );
    });
  }

  async generateAudioStream(text: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const synthesizer = new speechSdk.SpeechSynthesizer(this.speechConfig);

      synthesizer.speakTextAsync(
        text,
        (result) => {
          if (result.reason === speechSdk.ResultReason.SynthesizingAudioCompleted) {
            const audioData = Buffer.from(result.audioData);
            synthesizer.close();
            resolve(audioData);
          } else {
            synthesizer.close();
            reject(new Error(`Speech synthesis failed: ${result.errorDetails}`));
          }
        },
        (error) => {
          synthesizer.close();
          reject(new Error(`Speech synthesis error: ${error}`));
        }
      );
    });
  }
}

// Factory function to create the service
export function createAzureSpeechService(): AzureSpeechService | null {
  const subscriptionKey = process.env.AZURE_SPEECH_KEY;
  const serviceRegion = process.env.AZURE_SPEECH_ENDPOINT?.replace('https://', '').replace('.cognitiveservices.azure.com/', '') || 'eastus';

  if (!subscriptionKey) {
    console.warn("Azure Speech Key not configured");
    return null;
  }

  return new AzureSpeechService({
    subscriptionKey,
    serviceRegion
  });
}