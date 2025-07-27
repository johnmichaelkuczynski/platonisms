import { generateAIResponse } from './ai-models.js';
import type { AIModel } from '../../shared/schema.js';

export async function generateSummaryWithThesis(
  sourceText: string,
  model: AIModel
): Promise<{ thesis: string; summary: string; fullResponse: string }> {
  const prompt = `Summarize the selected passage in the following format:
Thesis: [Concise 1–2 sentence main claim].
Summary: [Key logic, background, and implications of the passage].
Focus on clarity, conceptual structure, and explanatory relevance. Avoid restating the passage verbatim. Prioritize insight over coverage.

Output format must clearly separate:

Thesis (1–2 sentences)

Summary (3–6 sentences)

Selected passage:
${sourceText}`;

  const response = await generateAIResponse(model, prompt);

  // Parse the response to extract thesis and summary
  const thesisMatch = response.match(/(?:Thesis:?\s*)(.*?)(?=\n\s*Summary:|\n\n|$)/is);
  const summaryMatch = response.match(/(?:Summary:?\s*)(.*?)$/is);

  const thesis = thesisMatch ? thesisMatch[1].trim() : "Thesis extraction failed";
  const summary = summaryMatch ? summaryMatch[1].trim() : "Summary extraction failed";

  console.log("Generated summary with thesis:", { thesis: thesis.substring(0, 100), summary: summary.substring(0, 100) });

  return {
    thesis,
    summary,
    fullResponse: response
  };
}