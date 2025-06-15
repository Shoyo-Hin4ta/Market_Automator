import { createOpenAI } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';

export abstract class BaseAgent {
  protected model: any;
  
  constructor(protected apiKey: string) {
    // Initialize with appropriate model based on agent needs
    const openai = createOpenAI({
      apiKey: this.apiKey,
    });
    this.model = openai('gpt-4o');
  }
  
  abstract get systemPrompt(): string;
  abstract get name(): string;
  
  protected async generateStructured<T>(
    prompt: string,
    schema: z.ZodSchema<T>
  ): Promise<T> {
    const { object } = await generateObject({
      model: this.model,
      system: this.systemPrompt,
      schema,
      prompt,
    });
    
    return object;
  }
  
  protected async generateText(prompt: string): Promise<string> {
    const { text } = await generateText({
      model: this.model,
      system: this.systemPrompt,
      prompt,
    });
    
    return text;
  }
}