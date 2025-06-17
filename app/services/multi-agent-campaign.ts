import { OrchestratorAgent } from './agents/orchestrator-agent';
import { RefinementAgent } from './agents/refinement-agent';
import { AgentContext, RefinementRequest, ColorSelection } from './agents/types';

export class MultiAgentCampaignService {
  private orchestrator: OrchestratorAgent;
  private refinementAgent: RefinementAgent;
  
  constructor(private apiKey: string) {
    this.orchestrator = new OrchestratorAgent(apiKey);
    this.refinementAgent = new RefinementAgent(apiKey);
  }
  
  // REMOVED: generatePaletteOptions method - no longer needed
  
  async generateInitialContent(
    formData: any,
    selectedDesign: any,
    channels: string[]
  ): Promise<{
    email: string | null;
    landing: string | null;
    message: string;
    context: any;
  }> {
    const context: AgentContext = {
      formData: {
        product: formData.product,
        audience: formData.audience,
        purpose: formData.purpose,
        tone: formData.tone,
        theme: formData.theme,
        ctaEnabled: formData.ctaEnabled,
        ctaText: formData.ctaText,
        ctaLink: formData.ctaLink,
        selectedColors: formData.selectedColors, // Direct color selection
      },
      campaignName: formData.campaignName || 'Untitled Campaign',
      designUrl: formData.designUrl,
      selectedChannels: channels,
      selectedDesign,
    };
    
    const result = await this.orchestrator.coordinateGeneration(context);
    
    // Generate proactive message
    const proactiveMessage = this.orchestrator.generateProactiveMessage(
      result.metadata?.agentInsights?.analysis || {}
    );
    
    return {
      email: result.email || null,
      landing: result.landing || null,
      message: proactiveMessage,
      context: result.metadata,
    };
  }
  
  async refineContent(
    context: any,
    refinementRequest: string
  ): Promise<{
    email: string | null;
    landing: string | null;
    message: string;
    metadata?: any;
  }> {
    // Use the new refinement agent for direct HTML updates
    const result = await this.refinementAgent.refineContent(
      context.currentEmail,
      context.currentLanding,
      refinementRequest
    );
    
    // Generate a user-friendly message based on the request
    const userRequest = refinementRequest.toLowerCase();
    let message = '';
    
    if (userRequest.includes('heading') && userRequest.includes('color')) {
      message = `I've updated the heading color as requested.`;
    } else if (userRequest.includes('font') && userRequest.includes('color')) {
      message = `I've changed the font color as requested.`;
    } else if (userRequest.includes('background')) {
      message = `I've updated the background as requested.`;
    } else if (userRequest.includes('center')) {
      message = `I've centered the element as requested.`;
    } else if (userRequest.includes('bigger') || userRequest.includes('larger') || userRequest.includes('smaller')) {
      message = `I've adjusted the size as requested.`;
    } else if (userRequest.includes('professional')) {
      message = `I've updated the design to look more professional.`;
    } else if (userRequest.includes('color')) {
      message = `I've updated the colors as requested.`;
    } else if (userRequest.includes('spacing') || userRequest.includes('padding') || userRequest.includes('margin')) {
      message = `I've adjusted the spacing as requested.`;
    } else {
      // Generic but friendly message
      message = `I've made the requested changes.`;
    }
    
    // Add specific context if email or landing page was mentioned
    if (userRequest.includes('email')) {
      message += ` The email has been updated.`;
    } else if (userRequest.includes('landing') || userRequest.includes('page') || userRequest.includes('website')) {
      message += ` The landing page has been updated.`;
    }
    
    message += ` Take a look at the preview and let me know if you'd like any other changes!`;
    
    // Return the refined content with the previous metadata
    return {
      email: result.email,
      landing: result.landing,
      message,
      metadata: context.previousOutputs // Keep the original metadata
    };
  }
  
  // Compatibility methods for existing API
  async analyzeConversation(messages: any[]): Promise<any> {
    return { hasEnoughInfo: true };
  }
  
  async generateClarifyingQuestions(analysis: any): Promise<string> {
    return '';
  }
  
  async extractContext(
    latestMessage: string,
    messages: any[],
    selectedColors: any,
    themeStyle: string
  ): Promise<any> {
    return {};
  }
  
  async generateEmailContent(context: any, campaignName: string, designUrl: string): Promise<string> {
    const agentContext: AgentContext = {
      formData: context,
      campaignName,
      designUrl,
      selectedChannels: ['email'],
      selectedDesign: null,
    };
    
    const result = await this.orchestrator.coordinateGeneration(agentContext);
    return result.email;
  }
  
  async generateLandingPageContent(context: any, campaignName: string, designUrl: string): Promise<string> {
    const agentContext: AgentContext = {
      formData: context,
      campaignName,
      designUrl,
      selectedChannels: ['landing'],
      selectedDesign: null,
    };
    
    const result = await this.orchestrator.coordinateGeneration(agentContext);
    return result.landing;
  }
}