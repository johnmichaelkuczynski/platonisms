import OpenAI from "openai";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TTSOptions {
  text: string;
  voice?: string;
  model?: string;
}

export async function generateTTS(options: TTSOptions): Promise<string> {
  const { text, voice = "alloy", model = "tts-1" } = options;

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  // Limit text length for TTS (OpenAI has a 4096 character limit)
  const textToSpeak = text.length > 4000 ? text.substring(0, 4000) + "..." : text;

  try {
    const mp3 = await openai.audio.speech.create({
      model: model,
      voice: voice as any,
      input: textToSpeak,
    });

    // Generate unique filename
    const filename = `podcast-${uuidv4()}-${Date.now()}.mp3`;
    const audioDir = join(process.cwd(), 'dist', 'audio');
    const audioPath = join(audioDir, filename);

    // Ensure audio directory exists
    await mkdir(audioDir, { recursive: true });

    // Convert the response to buffer and save
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await writeFile(audioPath, buffer);

    // Return the public URL path
    return `/audio/${filename}`;
  } catch (error) {
    console.error("TTS generation error:", error);
    throw new Error(`Failed to generate audio: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}