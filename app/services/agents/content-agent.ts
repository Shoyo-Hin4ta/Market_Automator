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
    const prompt = `Create a comprehensive content strategy for this SPECIFIC product/service:
    
    CRITICAL: You MUST use these exact details in your content:
    Product/Service: "${formData.product}"
    Target Audience: "${formData.audience}"
    Campaign Purpose: "${formData.purpose}"
    Tone: ${formData.tone}
    Visual Theme: ${formData.theme}
    
    Generate content that:
    1. Headlines that specifically mention "${formData.product}" or directly reference what it does
    2. Body copy that explains how "${formData.product}" helps "${formData.audience}"
    3. Value propositions specific to "${formData.product}" - NO generic placeholders
    4. Benefits that directly relate to "${formData.purpose}"
    5. CTA variations based on ${formData.ctaEnabled ? `"${formData.ctaText}"` : 'no CTA needed'}
    6. Tone guidelines matching ${formData.tone} style
    
    IMPORTANT RULES:
    - Never use generic phrases like "your product", "your service", "your solution"
    - Always use the actual product name: "${formData.product}"
    - Speak directly to "${formData.audience}" using their language
    - Focus on achieving: "${formData.purpose}"
    
    Be specific, avoid generic marketing speak. Create content that could ONLY work for this product.`;
    
    return this.generateStructured(prompt, ContentStrategySchema);
  }
  
  async refineContent(
    currentStrategy: ContentStrategy,
    refinementRequest: string,
    context: any,
    brandSystem?: BrandSystem
  ): Promise<ContentStrategy> {
    const prompt = `Update this content strategy based on the user's request.
    
    Current Content Strategy:
    ${JSON.stringify(currentStrategy, null, 2)}
    
    User Request: ${refinementRequest}
    
    Campaign Context:
    - Product: ${context.formData?.product || context.product}
    - Audience: ${context.formData?.audience || context.audience}
    - Purpose: ${context.formData?.purpose || context.purpose}
    - Tone: ${context.formData?.tone || context.tone}
    
    Apply the changes requested by the user and return the complete updated ContentStrategy object.`;
    
    return this.generateStructured(prompt, ContentStrategySchema);
  }
}