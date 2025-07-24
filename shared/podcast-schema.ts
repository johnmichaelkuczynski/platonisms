import { z } from "zod";

export const podcastRequestSchema = z.object({
  selectedText: z.string().min(1, "Selected text is required"),
  instructionType: z.enum(["default", "custom"]),
  customInstructions: z.string().optional(),
  model: z.enum(["deepseek", "openai", "anthropic", "perplexity"]),
});

export type PodcastRequest = z.infer<typeof podcastRequestSchema>;

export const podcastResponseSchema = z.object({
  script: z.string(),
  audioUrl: z.string().optional(),
});

export type PodcastResponse = z.infer<typeof podcastResponseSchema>;