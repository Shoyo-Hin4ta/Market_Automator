import { z } from 'zod';
import { BaseAgent } from './base-agent';
import { BrandAgent } from './brand-agent';
import { ContentAgent } from './content-agent';
import { TechnicalAgent } from './technical-agent';
import { 
  AgentContext, 
  GeneratedContent, 
  RefinementRequest,
  BrandSystem,
  ContentStrategy 
} from './types';

const AnalysisSchema = z.object({
  strongPoints: z.array(z.string()),
  improvementAreas: z.array(z.string()),
  proactiveMessage: z.string(),
  suggestedRefinements: z.array(z.string()),
  confidenceScore: z.number().min(0).max(100),
});

const RefinementRoutingSchema = z.object({
  targetAgent: z.enum(['brand', 'content', 'technical', 'all']),
  refinementType: z.string(),
  specificInstructions: z.string(),
});

export class OrchestratorAgent extends BaseAgent {
  private brandAgent: BrandAgent;
  private contentAgent: ContentAgent;
  private technicalAgent: TechnicalAgent;
  
  constructor(apiKey: string) {
    super(apiKey);
    this.brandAgent = new BrandAgent(apiKey);
    this.contentAgent = new ContentAgent(apiKey);
    this.technicalAgent = new TechnicalAgent(apiKey);
  }
  
  get name() {
    return 'Orchestrator Agent';
  }
  
  get systemPrompt() {
    return `You are a senior marketing campaign orchestrator. You coordinate between specialized agents to create cohesive campaigns. You analyze outputs for quality and improvement opportunities. You generate helpful, specific questions to refine campaigns. Always be proactive in suggesting improvements while celebrating successes. Limit suggestions to 2-3 most impactful items.`;
  }
  
  async coordinateGeneration(context: AgentContext): Promise<GeneratedContent> {
    try {
      // Step 1: Brand System Generation
      console.log('🎨 Brand Agent: Creating design system...');
      const brandSystem = await this.brandAgent.generateBrandSystem(context.formData);
      
      // Step 2: Content Strategy Generation
      console.log('✍️ Content Agent: Developing messaging strategy...');
      const contentStrategy = await this.contentAgent.generateContentStrategy(
        context.formData,
        brandSystem
      );
      
      // Step 3: Technical Implementation
      console.log('🔧 Technical Agent: Building HTML templates...');
      const [email, landing] = await Promise.all([
        context.selectedChannels.includes('email') 
          ? this.technicalAgent.generateEmail(
              context.formData,
              brandSystem,
              contentStrategy,
              context.designUrl
            )
          : Promise.resolve(''),
        (context.selectedChannels.includes('github') || context.selectedChannels.includes('landing'))
          ? this.technicalAgent.generateLandingPage(
              context.formData,
              brandSystem,
              contentStrategy,
              context.designUrl
            )
          : Promise.resolve(''),
      ]);
      
      // Step 4: Analysis and Proactive Suggestions
      console.log('🤔 Analyzing results and preparing suggestions...');
      const analysis = await this.analyzeGeneration(
        { email, landing },
        brandSystem,
        contentStrategy,
        context
      );
      
      return {
        email,
        landing,
        metadata: {
          brandSystem,
          contentStrategy,
          agentInsights: {
            analysis,
            generationContext: {
              campaign: context.campaignName,
              channels: context.selectedChannels,
              timestamp: new Date().toISOString(),
            },
          },
          suggestedRefinements: analysis.suggestedRefinements,
        },
      };
    } catch (error: any) {
      console.error('Orchestration error:', error);
      throw new Error(`Campaign generation failed: ${error.message}`);
    }
  }
  
  async analyzeGeneration(
    content: { email: string; landing: string },
    brandSystem: BrandSystem,
    contentStrategy: ContentStrategy,
    context: AgentContext
  ): Promise<any> {
    const prompt = `Analyze this generated campaign for improvement opportunities:
    
    Context:
    - Product: ${context.formData.product}
    - Audience: ${context.formData.audience}
    - Purpose: ${context.formData.purpose}
    - Channels: ${context.selectedChannels.join(', ')}
    
    Brand System: Using ${context.formData.theme} theme with selected colors
    
    Content Strategy: 
    - Primary headline: "${contentStrategy.headlines.primary}"
    - Tone: ${contentStrategy.tone.voice} and ${contentStrategy.tone.emotion}
    
    Identify:
    1. 3-5 strong points to celebrate
    2. 2-3 areas that could be enhanced
    3. A friendly, proactive opening message for the chat
    4. EXACTLY 2-3 specific refinement suggestions (not questions)
    5. Overall confidence score (0-100)
    
    Be encouraging and specific. Focus on actionable improvements.`;
    
    return this.generateStructured(prompt, AnalysisSchema);
  }
  
  async handleRefinement(request: RefinementRequest): Promise<GeneratedContent> {
    // Determine which agent should handle the refinement
    const routing = await this.routeRefinement(request);
    
    let updatedBrandSystem: BrandSystem | undefined;
    let updatedContentStrategy: ContentStrategy | undefined;
    let updatedEmail = request.currentEmail || '';
    let updatedLanding = request.currentLanding || '';
    
    // Execute refinements based on routing
    switch (routing.targetAgent) {
      case 'brand':
        // For brand refinements, we need to get current brand system from metadata
        // This would need to be passed in the request context
        break;
        
      case 'content':
        // For content refinements, we need current content strategy from metadata
        break;
        
      case 'technical':
        if (request.currentEmail) {
          updatedEmail = await this.technicalAgent.refineImplementation(
            request.currentEmail,
            routing.specificInstructions,
            true
          );
        }
        if (request.currentLanding) {
          updatedLanding = await this.technicalAgent.refineImplementation(
            request.currentLanding,
            routing.specificInstructions,
            false
          );
        }
        break;
        
      case 'all':
        // Complete regeneration with specific focus
        return this.coordinateGeneration(request.context);
    }
    
    return {
      email: updatedEmail,
      landing: updatedLanding,
      metadata: {
        brandSystem: updatedBrandSystem || ({} as BrandSystem),
        contentStrategy: updatedContentStrategy || ({} as ContentStrategy),
        agentInsights: {
          refinementType: routing.refinementType,
          targetAgent: routing.targetAgent,
        },
        suggestedRefinements: [],
      },
    };
  }
  
  private async routeRefinement(request: RefinementRequest): Promise<any> {
    const prompt = `Route this refinement request to the appropriate agent:
    
    User Request: "${request.userRequest}"
    
    Context:
    - Has current email: ${!!request.currentEmail}
    - Has current landing: ${!!request.currentLanding}
    - Product: ${request.context.formData.product}
    
    Determine:
    1. Target agent: brand (visual style/typography), content (copy/messaging), technical (HTML/layout), or all (complete redo)
    2. Refinement type: what aspect is being refined
    3. Specific instructions for the target agent
    
    Note: Colors are user-selected and should not be changed unless explicitly requested.`;
    
    return this.generateStructured(prompt, RefinementRoutingSchema);
  }
  
  generateProactiveMessage(analysis: any): string {
    return `${analysis.proactiveMessage}

I spotted ways to make this even better:
${analysis.suggestedRefinements.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}

What would you like to focus on first, or does it look good to deploy?`;
  }
}