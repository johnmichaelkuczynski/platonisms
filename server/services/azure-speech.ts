import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import fs from "fs";
import path from "path";

interface AzureSpeechConfig {
  key: string;
  endpoint: string;
  region: string;
}

class AzureSpeechService {
  private speechConfig: sdk.SpeechConfig;
  private audioDir: string;

  constructor() {
    const key = process.env.AZURE_SPEECH_KEY;
    const endpoint = process.env.AZURE_SPEECH_ENDPOINT;
    
    if (!key || !endpoint) {
      throw new Error("Azure Speech credentials not configured");
    }

    // Extract region from endpoint
    const region = this.extractRegionFromEndpoint(endpoint);
    
    this.speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
    this.speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";
    this.speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;
    
    // Create audio directory
    this.audioDir = path.join(process.cwd(), "public", "audio");
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  private extractRegionFromEndpoint(endpoint: string): string {
    // Extract region from Azure endpoint format
    const match = endpoint.match(/https:\/\/([^.]+)\.cognitiveservices\.azure\.com/);
    return match ? match[1] : "eastus"; // fallback to eastus
  }

  async generateAudio(text: string, filename?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const audioFilename = filename || `podcast_${Date.now()}.mp3`;
      const audioPath = path.join(this.audioDir, audioFilename);
      
      const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioPath);
      const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig, audioConfig);

      synthesizer.speakTextAsync(
        text,
        (result) => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            console.log(`Audio synthesis completed: ${audioFilename}`);
            synthesizer.close();
            resolve(`/audio/${audioFilename}`);
          } else {
            console.error("Speech synthesis failed:", result.errorDetails);
            synthesizer.close();
            reject(new Error(`Speech synthesis failed: ${result.errorDetails}`));
          }
        },
        (error) => {
          console.error("Speech synthesis error:", error);
          synthesizer.close();
          reject(error);
        }
      );
    });
  }

  async generatePodcastAudio(script: string): Promise<string> {
    // Clean the script for better speech synthesis
    const cleanScript = this.cleanScriptForSpeech(script);
    
    // Generate unique filename
    const filename = `podcast_${Date.now()}.mp3`;
    
    return await this.generateAudio(cleanScript, filename);
  }

  private cleanScriptForSpeech(script: string): string {
    // Remove markdown formatting
    let cleaned = script
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic
      .replace(/#+ /g, '')             // Remove headers
      .replace(/\n+/g, ' ')            // Replace newlines with spaces
      .replace(/\s+/g, ' ')            // Normalize whitespace
      .trim();

    // Add natural pauses for better speech flow
    cleaned = cleaned
      .replace(/\. /g, '. <break time="500ms"/> ')
      .replace(/: /g, ': <break time="300ms"/> ')
      .replace(/; /g, '; <break time="300ms"/> ');

    // Wrap in SSML for better control
    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
      <voice name="en-US-JennyNeural">
        <prosody rate="medium" pitch="medium">
          ${cleaned}
        </prosody>
      </voice>
    </speak>`;
  }
}

export default AzureSpeechService;