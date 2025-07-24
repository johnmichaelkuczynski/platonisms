import { generateAIResponse } from "./ai-models.js";
import { createAzureSpeechService } from "./azure-speech.js";
import { AIModel } from "../../shared/schema.js";
import { join } from "path";
import { writeFileSync, mkdirSync, existsSync } from "fs";

export interface PodcastGenerationResult {
  script: string;
  audioPath?: string;
  audioBuffer?: Buffer;
}

export class PodcastService {
  private azureSpeechService = createAzureSpeechService();

  async generatePodcastScript(selectedText: string, model: AIModel): Promise<string> {
    const prompt = `You are creating a podcast script about the selected passage. Follow this exact structure:

**PODCAST SUMMARY FORMAT:**

1. **Brief Summary**: Start with a concise 2-3 sentence summary of what this passage covers.

2. **Strengths and Weaknesses**: Discuss 2-3 key strengths of the passage's arguments or presentation, then 2-3 potential weaknesses or limitations.

3. **Reader Insights**: Explain what readers will gain from this passage and what might be challenging or subtle to understand.

4. **Key Quotations**: Present 5 representative, high-quality quotations from the selected text that capture its essence. Format each as: "Quote text here" - followed by a brief explanation of why this quote is significant.

Write this as a natural, conversational podcast script that flows well when spoken aloud. Use transitions between sections and maintain an engaging, educational tone throughout.

**SELECTED PASSAGE:**
${selectedText}

Generate the podcast script following the structure above:`;

    try {
      const response = await generateAIResponse(model, prompt);
      return this.cleanMarkdownFormatting(response);
    } catch (error) {
      console.error("Error generating podcast script:", error);
      throw new Error("Failed to generate podcast script");
    }
  }

  private cleanMarkdownFormatting(text: string): string {
    return text
      // Remove markdown headers
      .replace(/#{1,6}\s+/g, '')
      // Remove bold/italic formatting
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Remove links
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Clean up extra whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  async generateAudio(script: string): Promise<{ audioPath?: string; audioBuffer?: Buffer }> {
    if (!this.azureSpeechService) {
      console.log("Azure Speech Service not configured - audio generation skipped");
      return {};
    }

    try {
      // Generate audio as buffer for immediate streaming
      const audioBuffer = await this.azureSpeechService.generateAudioStream(script);
      
      // Also save to file for download
      const timestamp = Date.now();
      const filename = `podcast_${timestamp}.mp3`;
      const audioDir = join(process.cwd(), "dist", "audio");
      
      if (!existsSync(audioDir)) {
        mkdirSync(audioDir, { recursive: true });
      }
      
      const filePath = join(audioDir, filename);
      writeFileSync(filePath, audioBuffer);
      
      return {
        audioPath: `/audio/${filename}`,
        audioBuffer
      };
    } catch (error) {
      console.error("Error generating audio:", error);
      console.log("Audio generation failed, returning script without audio");
      return {}; // Return empty object instead of throwing
    }
  }

  async generateCompletePodcast(selectedText: string, model: AIModel): Promise<PodcastGenerationResult> {
    // Generate the script
    const script = await this.generatePodcastScript(selectedText, model);
    
    // Generate audio if Azure Speech is available
    if (this.azureSpeechService) {
      try {
        const { audioPath, audioBuffer } = await this.generateAudio(script);
        return {
          script,
          audioPath,
          audioBuffer
        };
      } catch (error) {
        console.warn("Audio generation failed, returning script only:", error);
        return { script };
      }
    }
    
    return { script };
  }
}

export const podcastService = new PodcastService();