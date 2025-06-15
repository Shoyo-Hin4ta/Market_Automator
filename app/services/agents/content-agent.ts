import { z } from 'zod';
import { BaseAgent } from './base-agent';
import { CampaignFormData, ContentStrategy, BrandSystem } from './types';

const ContentStrategySchema = z.object({
  headlines: z.object({
    primary: z.string(),
    secondary: z.string(),
    email: z.string(),
  }),
  body: z.object({
    intro: z.string(),
    valueProps: z.array(z.string()),
    benefits: z.array(z.string()),
    socialProof: z.string().optional(),
  }),
  cta: z.object({
    primary: z.string(),
    secondary: z.string().optional(),
    urgency: z.string().optional(),
  }),
  tone: z.object({
    voice: z.string(),
    emotion: z.string(),
    formality: z.string(),
  }),
});

export class ContentAgent extends BaseAgent {
  get name() {
    return 'Content Strategy Agent';
  }
  
  get systemPrompt() {
    return `You are an expert marketing copywriter and content strategist. You create compelling, conversion-focused copy that resonates with target audiences. You understand psychology, persuasion, and how to craft messages that drive action. Always focus on benefits over features and use emotional triggers appropriately.`;
  }
  
  async generateContentStrategy(
    formData: CampaignFormData,
    brandSystem: BrandSystem
  ): Promise<ContentStrategy> {
    const prompt = `Create a comprehensive content strategy for:
    Product: ${formData.product}
    Audience: ${formData.audience}
    Purpose: ${formData.purpose}
    Tone: ${formData.tone}
    Visual Theme: ${formData.theme}
    
    Generate:
    1. Headlines (primary, secondary, email subject)
    2. Body copy structure (intro, value props, benefits)
    3. CTA variations based on ${formData.ctaEnabled ? formData.ctaText : 'no CTA needed'}
    4. Tone guidelines matching ${formData.tone} style
    
    Focus on emotional resonance and clear value communication.`;
    
    return this.generateStructured(prompt, ContentStrategySchema);
  }
  
  async refineContent(
    currentStrategy: ContentStrategy,
    refinementRequest: string,
    context: CampaignFormData
  ): Promise<ContentStrategy> {
    const prompt = `Refine this content strategy:
    
    Current Strategy:
    ${JSON.stringify(currentStrategy, null, 2)}
    
    Refinement Request: ${refinementRequest}
    
    Context:
    - Product: ${context.product}
    - Audience: ${context.audience}
    - Tone: ${context.tone}
    
    Maintain message consistency while addressing the specific request.`;
    
    return this.generateStructured(prompt, ContentStrategySchema);
  }
}