// Import helper functions from ai-models.ts
async function generateOpenAIResponse(prompt: string, systemPrompt: string): Promise<string> {
  const { generateAIResponse } = await import("./ai-models.js");
  return generateAIResponse("openai", prompt + "\n\n" + systemPrompt, true);
}

async function generateAnthropicResponse(prompt: string, systemPrompt: string): Promise<string> {
  const { generateAIResponse } = await import("./ai-models.js");
  return generateAIResponse("anthropic", prompt + "\n\n" + systemPrompt, true);
}

async function generateDeepSeekResponse(prompt: string, systemPrompt: string): Promise<string> {
  const { generateAIResponse } = await import("./ai-models.js");
  return generateAIResponse("deepseek", prompt + "\n\n" + systemPrompt, true);
}

async function generatePerplexityResponse(prompt: string, systemPrompt: string): Promise<string> {
  const { generateAIResponse } = await import("./ai-models.js");
  return generateAIResponse("perplexity", prompt + "\n\n" + systemPrompt, true);
}
import { AIModel } from "@shared/schema";

export async function generateCognitiveMap(
  sourceText: string,
  instructions: string,
  model: AIModel
): Promise<{ mapContent: string; mermaidDiagram: string }> {
  const systemPrompt = `You are an expert at creating cognitive maps and concept diagrams. Your task is to analyze the provided text and create a structured cognitive map showing the relationships between concepts, arguments, and ideas.

IMPORTANT INSTRUCTIONS:
1. Create a hierarchical cognitive map in text format showing:
   - Main thesis/central idea
   - Supporting arguments and sub-claims
   - Key definitions and concepts
   - Logical dependencies and relationships

2. Structure your response in TWO parts:
   - Part 1: TEXT MAP - A clear text-based hierarchy
   - Part 2: MERMAID DIAGRAM - A Mermaid.js flowchart syntax

3. For the text map, use clear indentation and arrows to show relationships:
   Example format:
   MAIN THESIS: [Main argument]
   ├── Supporting Argument 1
   │   ├── Premise A
   │   └── Premise B
   ├── Supporting Argument 2
   │   └── Evidence/Example
   └── Key Definitions
       ├── Term 1: Definition
       └── Term 2: Definition

4. For the Mermaid diagram, use proper flowchart syntax:
   Example:
   flowchart TD
       A[Main Thesis] --> B[Sub-argument 1]
       A --> C[Sub-argument 2]
       B --> D[Premise 1]
       B --> E[Premise 2]

5. Keep responses focused and clear. Avoid unnecessary commentary.`;

  const userPrompt = `Please analyze the following text and create a cognitive map following the instructions above:

${instructions}

TEXT TO ANALYZE:
${sourceText}

Provide your response in the exact format specified: TEXT MAP first, then MERMAID DIAGRAM.`;

  let response: string;

  try {
    switch (model) {
      case "openai":
        response = await generateOpenAIResponse(userPrompt, systemPrompt);
        break;
      case "anthropic":
        response = await generateAnthropicResponse(userPrompt, systemPrompt);
        break;
      case "deepseek":
        response = await generateDeepSeekResponse(userPrompt, systemPrompt);
        break;
      case "perplexity":
        response = await generatePerplexityResponse(userPrompt, systemPrompt);
        break;
      default:
        // Fallback to OpenAI
        response = await generateOpenAIResponse(userPrompt, systemPrompt);
        break;
    }
  } catch (error) {
    console.error(`Error with ${model} model:`, error);
    // Fallback to OpenAI if the selected model fails
    try {
      response = await generateOpenAIResponse(userPrompt, systemPrompt);
    } catch (fallbackError) {
      console.error("Fallback to OpenAI also failed:", fallbackError);
      throw new Error("Failed to generate cognitive map with all available models");
    }
  }

  // Parse the response to extract text map and mermaid diagram
  const parts = response.split(/MERMAID DIAGRAM|Part 2:|flowchart/i);
  
  let mapContent = response;
  let mermaidDiagram = "";

  if (parts.length >= 2) {
    mapContent = parts[0].replace(/TEXT MAP|Part 1:/i, "").trim();
    
    // Find the mermaid diagram content
    const mermaidMatch = response.match(/flowchart[\s\S]*$/i);
    if (mermaidMatch) {
      mermaidDiagram = "flowchart" + mermaidMatch[0].substring(9);
    } else {
      // Generate a basic mermaid diagram if none provided
      mermaidDiagram = `flowchart TD
    A[Main Concept] --> B[Supporting Idea 1]
    A --> C[Supporting Idea 2]
    B --> D[Detail 1]
    C --> E[Detail 2]`;
    }
  } else {
    // If parsing fails, generate a basic mermaid diagram
    mermaidDiagram = `flowchart TD
    A[Analysis Complete] --> B[See Text Map Above]
    A --> C[Structured Hierarchy]
    B --> D[Main Arguments]
    C --> E[Key Relationships]`;
  }

  console.log("Generated cognitive map content:", response);
  console.log("Map content length:", response.length);
  console.log("Final mapContent:", mapContent);

  return {
    mapContent: mapContent.trim(),
    mermaidDiagram: mermaidDiagram.trim()
  };
}