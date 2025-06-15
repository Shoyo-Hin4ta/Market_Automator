import { z } from 'zod';
import { BaseAgent } from './base-agent';
import { CampaignFormData, BrandSystem, ColorSelection } from './types';

const BrandSystemSchema = z.object({
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    background: z.string(),
    text: z.string(),
  }),
  typography: z.object({
    headingFont: z.string(),
    bodyFont: z.string(),
    fontSizes: z.object({
      h1: z.string(),
      h2: z.string(),
      h3: z.string(),
      body: z.string(),
      small: z.string(),
    }),
  }),
  spacing: z.object({
    small: z.string(),
    medium: z.string(),
    large: z.string(),
    xlarge: z.string(),
  }),
  visualStyle: z.object({
    borderRadius: z.string(),
    shadowStyle: z.string(),
    buttonStyle: z.string(),
    layoutStyle: z.string(),
  }),
});

const ColorSelectionSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
  background: z.string(),
  text: z.string(),
});

export class BrandAgent extends BaseAgent {
  get name() {
    return 'Brand & Design Agent';
  }
  
  get systemPrompt() {
    return `You are an expert brand designer and visual systems architect. You create cohesive, professional design systems and color palettes. You understand color theory, typography, spacing, and modern web design principles. Always provide specific, implementable design tokens.`;
  }
  
  async generateBrandSystem(formData: CampaignFormData): Promise<BrandSystem> {
    const prompt = `Create a comprehensive brand system for:
    Product: ${formData.product}
    Audience: ${formData.audience}
    Tone: ${formData.tone}
    Theme: ${formData.theme}
    
    Using these exact colors (DO NOT modify these):
    - Primary: ${formData.selectedColors.primary}
    - Secondary: ${formData.selectedColors.secondary}
    - Accent: ${formData.selectedColors.accent}
    - Background: ${formData.selectedColors.background}
    - Text: ${formData.selectedColors.text}
    
    Generate:
    1. Typography system with web-safe font stacks that match the ${formData.theme} theme
    2. Spacing system using rem units
    3. Visual style guidelines for the ${formData.theme} theme (border radius, shadows, etc.)
    
    The colors object should pass through the exact hex values provided above.`;
    
    return this.generateStructured(prompt, BrandSystemSchema);
  }
  
  async refineBrandSystem(
    currentSystem: BrandSystem,
    refinementRequest: string
  ): Promise<BrandSystem> {
    const prompt = `Refine this brand system based on the request:
    
    Current System:
    ${JSON.stringify(currentSystem, null, 2)}
    
    Refinement Request: ${refinementRequest}
    
    IMPORTANT: Keep the exact same color values unless specifically asked to change them.
    Focus on refining typography, spacing, or visual style elements.`;
    
    return this.generateStructured(prompt, BrandSystemSchema);
  }
  
  async generateColorPalette(formData: Partial<CampaignFormData>): Promise<ColorSelection> {
    const prompt = `Generate a professional color palette for:
    Product: ${formData.product}
    Audience: ${formData.audience}
    Purpose: ${formData.purpose}
    Tone: ${formData.tone}
    Theme: ${formData.theme}
    
    Create a cohesive color palette that:
    1. Matches the ${formData.theme} theme aesthetic
    2. Appeals to ${formData.audience}
    3. Conveys a ${formData.tone} tone
    4. Works well for ${formData.product}
    
    Rules:
    - Primary: Main brand color, should be memorable and versatile
    - Secondary: Complements primary, used for accents and variation
    - Accent: High contrast color for CTAs and important elements
    - Background: Light color for main background (usually light gray or off-white)
    - Text: Dark color for body text with excellent readability
    
    Return hex color values only.`;
    
    return this.generateStructured(prompt, ColorSelectionSchema);
  }
}