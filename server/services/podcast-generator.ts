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

  async generatePodcastSummary(sourceText: string, model: AIModel, customInstructions?: string): Promise<PodcastGenerationResult> {
    // Generate the podcast script using AI
    const script = await this.generatePodcastScript(sourceText, model, customInstructions);
    
    let audioPath: string | undefined;
    
    // Generate audio if Azure Speech is available
    if (this.azureSpeech) {
      try {
        audioPath = await this.azureSpeech.generatePodcastAudio(script);
        console.log("Audio generated successfully:", audioPath);
      } catch (error) {
        console.error("Failed to generate audio:", error);
        // Continue without audio - script will still be available
      }
    } else {
      console.log("Azure Speech service not available - script only");
    }
    
    return { script, audioPath };
  }

  private async generatePodcastScript(sourceText: string, model: AIModel, customInstructions?: string): Promise<string> {
    let prompt: string;
    
    if (customInstructions) {
      // Use custom instructions provided by user
      prompt = `Create a podcast-style summary of the following passage based on these specific instructions: ${customInstructions}

Text to analyze:
${sourceText}

Remember: This will be converted to audio, so write in a natural speaking style suitable for audio playback. Use conversational language, clear transitions, and natural pacing.`;
    } else {
      // Use default format: Summary, Strengths, Challenges, Five Quotes
      prompt = `Create a comprehensive podcast-style summary of the following passage. Format your response as a natural, engaging narration suitable for audio playback.

Your podcast summary must include these elements in order:

1. BRIEF SUMMARY: A concise overview of the main ideas and themes in the passage

2. STRENGTHS AND WEAKNESSES: Discuss what makes this passage valuable and what aspects might be challenging or controversial

3. READER INSIGHTS: Explain what readers can gain from this passage and what subtle or difficult concepts they should watch for

4. FIVE REPRESENTATIVE QUOTES: Present five high-quality quotations from the text that capture its essence

Structure this as a flowing narrative suitable for audio listening. Use conversational language, clear transitions, and natural pacing. Avoid bullet points or formal academic formatting.

Text to analyze:
${sourceText}

Remember: This will be converted to audio, so write in a natural speaking style with clear organization and smooth transitions between sections.`;
    }

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