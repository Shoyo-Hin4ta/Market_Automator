import { OrchestratorAgent } from './agents/orchestrator-agent';
import { AgentContext, RefinementRequest, ColorSelection } from './agents/types';

export class MultiAgentCampaignService {
  private orchestrator: OrchestratorAgent;
  
  constructor(private apiKey: string) {
    this.orchestrator = new OrchestratorAgent(apiKey);
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
  }> {
    const request: RefinementRequest = {
      currentEmail: context.currentEmail,
      currentLanding: context.currentLanding,
      userRequest: refinementRequest,
      context: context.agentContext,
    };
    
    const result = await this.orchestrator.handleRefinement(request);
    
    return {
      email: result.email || null,
      landing: result.landing || null,
      message: `I've updated the content based on your feedback. The changes have been applied to the preview!`,
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