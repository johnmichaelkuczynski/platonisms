import { generateAIResponse } from './ai-models.js';
import type { AIModel } from '../../shared/schema.js';

export async function generateThesisDeepDive(
  sourceText: string,
  model: AIModel,
  comparisonTarget?: string
): Promise<{ 
  extractedThesis: string; 
  originalWording: string; 
  modernApplications: string; 
  crossComparison: string; 
  fullResponse: string 
}> {
  const comparisonInstruction = comparisonTarget 
    ? `When performing cross-comparison, focus specifically on comparing with ${comparisonTarget}.`
    : "";

  const prompt = `Extract the core thesis of the selected passage. Then:
(a) Quote the original wording of the thesis from the passage.
(b) Explain the practical or theoretical relevance of the thesis in a contemporary context.
(c) Cross-check the thesis with relevant modern thinkers, frameworks, or disciplines (e.g. neuroscience, evolutionary psychology, philosophy of mind, AI, education). Highlight areas of agreement, contradiction, or obsolescence. Keep the analysis dense, precise, and content-driven.

${comparisonInstruction}

Organize the output into clearly labeled sections:

Extracted Thesis

Original Wording

Modern Applications

Cross-Comparison

Selected passage:
${sourceText}`;

  const response = await generateAIResponse(model, prompt);

  // Parse the response to extract each section
  const extractedThesisMatch = response.match(/(?:Extracted Thesis:?\s*)(.*?)(?=\n\s*Original Wording:|\n\n)/is);
  const originalWordingMatch = response.match(/(?:Original Wording:?\s*)(.*?)(?=\n\s*Modern Applications:|\n\n)/is);
  const modernApplicationsMatch = response.match(/(?:Modern Applications:?\s*)(.*?)(?=\n\s*Cross-Comparison:|\n\n)/is);
  const crossComparisonMatch = response.match(/(?:Cross-Comparison:?\s*)(.*?)$/is);

  const extractedThesis = extractedThesisMatch ? extractedThesisMatch[1].trim() : "Thesis extraction failed";
  const originalWording = originalWordingMatch ? originalWordingMatch[1].trim() : "Original wording extraction failed";
  const modernApplications = modernApplicationsMatch ? modernApplicationsMatch[1].trim() : "Modern applications extraction failed";
  const crossComparison = crossComparisonMatch ? crossComparisonMatch[1].trim() : "Cross-comparison extraction failed";

  console.log("Generated thesis deep-dive:", { 
    extractedThesis: extractedThesis.substring(0, 100), 
    modernApplications: modernApplications.substring(0, 100) 
  });

  return {
    extractedThesis,
    originalWording,
    modernApplications,
    crossComparison,
    fullResponse: response
  };
}