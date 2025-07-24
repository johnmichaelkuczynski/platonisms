import { generateAIResponse } from "./ai-models";
import { generateTTS } from "./tts-service";
import type { AIModel } from "@shared/schema";

export interface PodcastGenerationOptions {
  selectedText: string;
  instructionType: "default" | "custom";
  customInstructions?: string;
  model: AIModel;
  generateAudio?: boolean;
  voice?: string;
}

export async function generatePodcastScript(options: PodcastGenerationOptions): Promise<{ script: string; audioUrl?: string }> {
  const { selectedText, instructionType, customInstructions, model, generateAudio, voice } = options;

  let systemPrompt = "";
  let userPrompt = "";

  if (instructionType === "default") {
    systemPrompt = `You are an expert podcast creator who creates engaging, conversational audio content. Create a podcast script that flows naturally as spoken content.

IMPORTANT FORMATTING RULES:
- Write in a conversational, spoken style as if for audio
- Use natural speech patterns and transitions
- No markdown formatting, headers, or bullet points
- Write as continuous flowing text with natural paragraph breaks
- Include verbal transitions like "Now, let's talk about..." or "Moving on to..."
- Make it sound like a real person speaking, not reading from notes

Your podcast should cover these four key areas in a natural, flowing conversation:

1. SUMMARY AND ANALYSIS: Provide a clear overview of the main ideas and analyze their significance
2. DISCUSSION OF STRENGTHS: Highlight what works well, what's compelling, or what's particularly insightful
3. DISCUSSION OF POTENTIAL CHALLENGES: Address what readers might find difficult, controversial, or problematic
4. REPRESENTATIVE QUOTATIONS: Weave in key quotes naturally within the discussion, not as a separate section

Create an engaging 3-5 minute podcast script that covers all these elements in a natural, conversational flow.`;

    userPrompt = `Create a podcast script analyzing this text: "${selectedText}"`;
  } else {
    systemPrompt = `You are an expert podcast creator who creates engaging, conversational audio content. Create a podcast script based on the user's specific instructions.

IMPORTANT FORMATTING RULES:
- Write in a conversational, spoken style as if for audio
- Use natural speech patterns and transitions
- No markdown formatting, headers, or bullet points
- Write as continuous flowing text with natural paragraph breaks
- Include verbal transitions like "Now, let's talk about..." or "Moving on to..."
- Make it sound like a real person speaking, not reading from notes

Follow the user's instructions while maintaining a natural podcast format.`;

    userPrompt = `Create a podcast script for this text: "${selectedText}"

User instructions: ${customInstructions}`;
  }

  try {
    const script = await generateAIResponse(userPrompt, model as AIModel, [], systemPrompt);
    
    // If audio generation is requested, create TTS
    let audioUrl: string | undefined;
    if (generateAudio) {
      try {
        audioUrl = await generateTTS({
          text: script,
          voice: voice || "alloy"
        });
      } catch (ttsError) {
        console.error("TTS generation failed:", ttsError);
        // Don't fail the entire request if TTS fails
        throw new Error(`Audio generation failed: ${ttsError instanceof Error ? ttsError.message : "Unknown TTS error"}`);
      }
    }
    
    return { script, audioUrl };
  } catch (error) {
    console.error("Error generating podcast script:", error);
    throw new Error(`Failed to generate podcast script: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}