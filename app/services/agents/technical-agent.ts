import { BaseAgent } from './base-agent';
import { BrandSystem, ContentStrategy, CampaignFormData } from './types';

export class TechnicalAgent extends BaseAgent {
  get name() {
    return 'Technical Implementation Agent';
  }
  
  private cleanHtmlOutput(html: string): string {
    // Remove markdown code blocks if present
    let cleaned = html;
    
    // Remove ```html and ``` markers
    cleaned = cleaned.replace(/^```html\s*\n?/i, '');
    cleaned = cleaned.replace(/\n?```\s*$/i, '');
    
    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();
    
    // If the response doesn't start with HTML tags, try to extract HTML
    if (!cleaned.match(/^<(!DOCTYPE|html)/i)) {
      // Try to find HTML content after any explanatory text
      const htmlMatch = cleaned.match(/<(!DOCTYPE|html)[\s\S]*$/i);
      if (htmlMatch) {
        cleaned = htmlMatch[0];
      }
    }
    
    return cleaned;
  }
  
  get systemPrompt() {
    return `You are an expert frontend developer specializing in email and landing page development. You create clean, responsive HTML with inline CSS for emails and modern CSS for landing pages. You ensure cross-platform compatibility and follow best practices for performance and accessibility. Always use CDN links for external resources. IMPORTANT: Return ONLY the HTML code without any explanations, markdown formatting, or commentary. The response should start with the HTML directly.`;
  }
  
  async generateEmail(
    formData: CampaignFormData,
    brandSystem: BrandSystem,
    contentStrategy: ContentStrategy,
    designUrl?: string
  ): Promise<string> {
    const prompt = `Create a responsive email template for "${formData.product}":
    
    CRITICAL CONTEXT:
    - Product: "${formData.product}"
    - Audience: "${formData.audience}"
    - Purpose: "${formData.purpose}"
    
    Design System:
    ${JSON.stringify(brandSystem, null, 2)}
    
    Content Strategy (USE THESE EXACT HEADLINES AND COPY):
    ${JSON.stringify(contentStrategy, null, 2)}
    
    Requirements:
    - Mobile-responsive table-based layout
    - Inline CSS for email compatibility
    - Include design image: ${designUrl || 'use placeholder'}
    - IMPORTANT: Center the design image in the hero section with proper spacing
    - ${formData.ctaEnabled ? `CTA button with text "${formData.ctaText}" linking to: ${formData.ctaLink}` : 'No CTA'}
    - Support for all major email clients
    - Use the exact hex colors provided in the brand system
    
    CONTENT RULES:
    - Use the EXACT headlines from contentStrategy
    - Include ALL value propositions and benefits from contentStrategy
    - Never use generic placeholders - use the actual product name "${formData.product}"
    - Email should clearly be about "${formData.product}" for "${formData.audience}"
    
    IMPORTANT: Return ONLY the HTML code. Do not include any explanations, markdown code blocks, or commentary. Start your response with <!DOCTYPE html> or <html>.`;
    
    const html = await this.generateText(prompt);
    return this.cleanHtmlOutput(html);
  }
  
  async generateLandingPage(
    formData: CampaignFormData,
    brandSystem: BrandSystem,
    contentStrategy: ContentStrategy,
    designUrl?: string
  ): Promise<string> {
    const prompt = `Create a modern landing page for "${formData.product}":
    
    CRITICAL CONTEXT:
    - Product: "${formData.product}"
    - Audience: "${formData.audience}"
    - Purpose: "${formData.purpose}"
    
    Design System:
    ${JSON.stringify(brandSystem, null, 2)}
    
    Content Strategy (USE THESE EXACT HEADLINES AND COPY):
    ${JSON.stringify(contentStrategy, null, 2)}
    
    Requirements:
    - Single HTML file with embedded CSS
    - Use Tailwind CSS via CDN
    - Include smooth animations
    - Mobile-first responsive design
    - Hero section with design image: ${designUrl || 'use placeholder'}
    - IMPORTANT: Center the design image in the hero section (use mx-auto and proper container)
    - ${formData.ctaEnabled ? `Multiple CTA buttons with text "${formData.ctaText}" linking to: ${formData.ctaLink}` : 'No CTA'}
    - Modern, accessible, performant
    - Theme: ${formData.theme} visual style
    - Use the exact hex colors provided in the brand system
    
    CONTENT RULES:
    - Hero headline MUST be the primary headline from contentStrategy
    - Subheadline MUST be the secondary headline from contentStrategy
    - Feature sections MUST use the value propositions from contentStrategy
    - Benefits section MUST use the benefits from contentStrategy
    - Never use generic placeholders - always mention "${formData.product}" specifically
    - Content should clearly explain what "${formData.product}" does for "${formData.audience}"
    - Focus on achieving: "${formData.purpose}"
    
    IMPORTANT: Return ONLY the HTML code. Do not include any explanations, markdown code blocks, or commentary. Start your response with <!DOCTYPE html>.`;
    
    const html = await this.generateText(prompt);
    return this.cleanHtmlOutput(html);
  }
  
  async refineImplementation(
    currentHtml: string,
    refinementRequest: string,
    isEmail: boolean
  ): Promise<string> {
    const prompt = `Refine this ${isEmail ? 'email' : 'landing page'} HTML:
    
    Refinement Request: ${refinementRequest}
    
    Current HTML:
    ${currentHtml}
    
    Maintain the overall structure while addressing the specific request.
    ${isEmail ? 'Ensure email client compatibility.' : 'Keep it as a single HTML file.'}
    
    IMPORTANT: Return ONLY the HTML code. Do not include any explanations, markdown code blocks, or commentary. Start your response with <!DOCTYPE html> or <html>.`;
    
    const html = await this.generateText(prompt);
    return this.cleanHtmlOutput(html);
  }
  
  async refineWithContext(params: {
    currentEmail?: string
    currentLanding?: string
    instructions: string
    brandSystem: BrandSystem
    contentStrategy: ContentStrategy
    context: any
    target?: 'email' | 'landing' | 'both'
  }): Promise<{ email?: string; landing?: string }> {
    const result: { email?: string; landing?: string } = {};
    const target = params.target || 'both';
    
    // Only update email if target includes it
    if (params.currentEmail && (target === 'email' || target === 'both')) {
      const prompt = `Update this email HTML based on the user's request.
      
      User Request: ${params.instructions}
      
      Current HTML:
      ${params.currentEmail}
      
      Updated Brand System (use these colors/fonts):
      ${JSON.stringify(params.brandSystem, null, 2)}
      
      Updated Content (use these headlines/text):
      ${JSON.stringify(params.contentStrategy, null, 2)}
      
      Context:
      - Product: "${params.context.formData?.product || ''}"
      - Design Image URL: "${params.context.designUrl || ''}"
      
      Apply ALL changes requested by the user. Return ONLY the updated HTML code.`;
      
      const html = await this.generateText(prompt);
      result.email = this.cleanHtmlOutput(html);
    } else if (params.currentEmail && target !== 'email') {
      // Keep the original email if not targeted
      result.email = params.currentEmail;
    }
    
    // Only update landing if target includes it
    if (params.currentLanding && (target === 'landing' || target === 'both')) {
      const prompt = `Update this landing page HTML based on the user's request.
      
      User Request: ${params.instructions}
      
      Current HTML:
      ${params.currentLanding}
      
      Updated Brand System (use these colors/fonts):
      ${JSON.stringify(params.brandSystem, null, 2)}
      
      Updated Content (use these headlines/text):
      ${JSON.stringify(params.contentStrategy, null, 2)}
      
      Context:
      - Product: "${params.context.formData?.product || ''}"
      - Design Image URL: "${params.context.designUrl || ''}"
      
      Apply ALL changes requested by the user. Return ONLY the updated HTML code.`;
      
      const html = await this.generateText(prompt);
      result.landing = this.cleanHtmlOutput(html);
    } else if (params.currentLanding && target !== 'landing') {
      // Keep the original landing if not targeted
      result.landing = params.currentLanding;
    }
    
    return result;
  }
}