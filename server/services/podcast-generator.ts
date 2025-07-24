import { generateAIResponse } from "./ai-models";
import AzureSpeechService from "./azure-speech";
import { AIModel } from "@shared/schema";

interface PodcastGenerationResult {
  script: string;
  audioPath?: string;
}

class PodcastGenerator {
  private azureSpeech: AzureSpeechService | null;

  constructor() {
    try {
      this.azureSpeech = new AzureSpeechService();
    } catch (error: any) {
      console.warn("Azure Speech not configured:", error.message);
      this.azureSpeech = null;
    }
  }

  async generatePodcastSummary(sourceText: string, model: AIModel): Promise<PodcastGenerationResult> {
    // Generate the podcast script using AI
    const script = await this.generatePodcastScript(sourceText, model);
    
    let audioPath: string | undefined;
    
    // Generate audio if Azure Speech is available
    if (this.azureSpeech) {
      try {
        audioPath = await this.azureSpeech.generatePodcastAudio(script);
      } catch (error) {
        console.error("Failed to generate audio:", error);
        // Continue without audio - script will still be available
      }
    }
    
    return { script, audioPath };
  }

  private async generatePodcastScript(sourceText: string, model: AIModel): Promise<string> {
    const prompt = `Create a comprehensive podcast-style summary of the following passage. Format your response as a natural, engaging narration suitable for audio playback.

Your podcast summary must include these elements in order:

1. BRIEF SUMMARY: A concise overview of the main ideas and themes in the passage

2. STRENGTHS AND WEAKNESSES: Discuss what makes this passage valuable and what aspects might be challenging or controversial

3. READER INSIGHTS: Explain what readers can gain from this passage and what subtle or difficult concepts they should watch for

4. KEY QUOTATIONS: Present five representative and high-quality quotations from the text that capture its essence

Structure this as a flowing narrative suitable for audio listening. Use conversational language, clear transitions, and natural pacing. Avoid bullet points or formal academic formatting.

Text to analyze:
${sourceText}

Remember: This will be converted to audio, so write in a natural speaking style with clear organization and smooth transitions between sections.`;

    return await generateAIResponse(model, prompt, true);
  }

  // Preview function for unregistered users
  generatePreview(script: string): string {
    const words = script.split(' ');
    if (words.length <= 100) {
      return script;
    }
    
    const preview = words.slice(0, 100).join(' ');
    return `${preview}... [PREVIEW - Purchase credits to access the complete podcast script and audio generation. Register and buy credits to unlock full functionality.]`;
  }
}

export default PodcastGenerator;