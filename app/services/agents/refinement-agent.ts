import { BaseAgent } from './base-agent';

export class RefinementAgent extends BaseAgent {
  get name() {
    return 'Refinement Agent';
  }
  
  get systemPrompt() {
    return `You are an expert at modifying HTML based on user requests. You understand CSS, HTML structure, and can make precise changes to existing code.

When given email and landing page HTML along with a user request:
1. Understand from the user's request which output they want modified
2. If they mention "email", "mail", "newsletter", "in the email", "email header", "email footer" - only modify the email HTML
3. If they mention "landing page", "website", "web page", "site", "webpage", "on the page", "homepage" - only modify the landing page HTML
4. If they mention both or it's unclear, modify both appropriately
5. Apply the exact changes requested while maintaining the rest of the structure
6. Ensure all changes are properly implemented with correct CSS/HTML

Remember: Users may use common terms like "website" when referring to the landing page, or "mail" when referring to email. Understand their intent from context.

IMPORTANT: Return ONLY the HTML code without any explanations, markdown formatting, or commentary. The response should contain the HTML directly.`;
  }
  
  async refineContent(
    currentEmail: string | null,
    currentLanding: string | null,
    userRequest: string
  ): Promise<{ email: string | null; landing: string | null }> {
    const result: { email: string | null; landing: string | null } = {
      email: currentEmail,
      landing: currentLanding
    };
    
    // Determine what needs to be refined based on the user request
    const requestLower = userRequest.toLowerCase();
    const isEmailSpecific = /\b(email|e-mail|mail|newsletter|subject)\b/.test(requestLower);
    const isLandingSpecific = /\b(landing|website|web\s?page|site|webpage|homepage)\b/.test(requestLower) && !isEmailSpecific;
    
    // If user specifically mentions email, only update email
    if (isEmailSpecific && currentEmail) {
      const prompt = `User request: "${userRequest}"
      
Current email HTML:
${currentEmail}

Apply the user's requested changes to the email HTML. Return ONLY the updated HTML code.`;
      
      const updatedHtml = await this.generateText(prompt);
      result.email = this.cleanHtmlOutput(updatedHtml);
    }
    // If user specifically mentions landing page, only update landing
    else if (isLandingSpecific && currentLanding) {
      const prompt = `User request: "${userRequest}"
      
Current landing page HTML:
${currentLanding}

Apply the user's requested changes to the landing page HTML. Return ONLY the updated HTML code.`;
      
      const updatedHtml = await this.generateText(prompt);
      result.landing = this.cleanHtmlOutput(updatedHtml);
    }
    // Otherwise, let the AI decide based on the request
    else {
      // Update email if it exists and seems relevant
      if (currentEmail) {
        const emailPrompt = `User request: "${userRequest}"
        
Current email HTML:
${currentEmail}

Determine if this request applies to the email. If yes, apply the changes and return the updated HTML. If the request doesn't apply to the email, return the original HTML unchanged. Return ONLY the HTML code.`;
        
        const updatedEmail = await this.generateText(emailPrompt);
        result.email = this.cleanHtmlOutput(updatedEmail);
      }
      
      // Update landing page if it exists and seems relevant
      if (currentLanding) {
        const landingPrompt = `User request: "${userRequest}"
        
Current landing page HTML:
${currentLanding}

Determine if this request applies to the landing page. If yes, apply the changes and return the updated HTML. If the request doesn't apply to the landing page, return the original HTML unchanged. Return ONLY the HTML code.`;
        
        const updatedLanding = await this.generateText(landingPrompt);
        result.landing = this.cleanHtmlOutput(updatedLanding);
      }
    }
    
    return result;
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
}