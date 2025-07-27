import { generateAIResponse } from './ai-models';
import type { AIModel } from '@shared/schema';

interface SuggestedReadingsRequest {
  sourceText: string;
  model: AIModel;
  instructions?: string;
  chunkIndex?: number;
}

interface SuggestedReadingsResponse {
  readingsList: string;
}

export async function generateSuggestedReadings(request: SuggestedReadingsRequest): Promise<SuggestedReadingsResponse> {
  const { sourceText, model, instructions } = request;

  const systemPrompt = `You are an expert academic researcher and bibliographer. Based on the ideas, themes, and subject matter in the provided text passage, generate a list of relevant academic or intellectual works (books, articles, or essays). Include both historical and contemporary sources that would be valuable for someone studying these topics.

For each recommended work, provide:
(a) Full title
(b) Author
(c) One-sentence explanation of relevance to the passage

CRITICAL FORMATTING: Return ONLY a clean bulleted list with 5-10 entries. Each entry must be on its own line starting with a bullet point.

Format each entry EXACTLY as:
• "Title" by Author - Brief explanation of relevance.

Do NOT include any introductory text, explanations, or additional paragraphs. Start immediately with the first bullet point and end with the last bullet point.

Ensure recommendations span different time periods and perspectives when appropriate.`;

  const userPrompt = `Based on this passage, recommend relevant academic works:

${sourceText}

${instructions ? `Special instructions: ${instructions}` : ''}

Provide 5-10 scholarly recommendations in a clean bulleted list format. Start immediately with the first bullet point - no introductory text or explanations.

EXAMPLE FORMAT:
• "Title One" by Author Name - Brief relevance explanation.
• "Title Two" by Author Name - Brief relevance explanation.`;

  try {
    const response = await generateAIResponse(model, systemPrompt, userPrompt, false);
    
    return {
      readingsList: response
    };
  } catch (error) {
    console.error('Error generating suggested readings:', error);
    throw new Error('Failed to generate suggested readings');
  }
}