import { generateAIResponse } from './ai-models';
import type { AIModel } from '@shared/schema';

interface SuggestedReadingsRequest {
  sourceText: string;
  model: AIModel;
  chunkIndex?: number;
}

interface SuggestedReadingsResponse {
  readingsList: string;
}

export async function generateSuggestedReadings(request: SuggestedReadingsRequest): Promise<SuggestedReadingsResponse> {
  const { sourceText, model } = request;

  const systemPrompt = `You are an expert academic researcher and bibliographer. Based on the ideas, themes, and subject matter in the provided text passage, generate a list of relevant academic or intellectual works (books, articles, or essays). Include both historical and contemporary sources that would be valuable for someone studying these topics.

For each recommended work, provide:
(a) Full title
(b) Author
(c) One-sentence explanation of relevance to the passage

Return a bulleted list with 5-10 entries. Focus on high-quality, influential works that directly relate to the themes and concepts in the passage.

Format each entry as:
• "Title" by Author - Brief explanation of relevance.

Ensure recommendations span different time periods and perspectives when appropriate.`;

  const userPrompt = `Based on this passage, recommend relevant academic works:

${sourceText}

Please provide 5-10 scholarly recommendations that would help someone understand the ideas, themes, and subject matter in this text.`;

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