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
      // Log the context to ensure we have proper data
      console.log('🎯 Orchestrator: Starting generation with context:', {
        product: context.formData.product,
        audience: context.formData.audience,
        purpose: context.formData.purpose,
        campaign: context.campaignName
      });
      
      // Step 1: Brand System Generation
      console.log('🎨 Brand Agent: Creating design system...');
      const brandSystem = await this.brandAgent.generateBrandSystem(context.formData);
      
      // Step 2: Content Strategy Generation
      console.log('✍️ Content Agent: Developing messaging strategy...');
      const contentStrategy = await this.contentAgent.generateContentStrategy(
        context.formData,
        brandSystem
      );
      
      // Log content strategy to ensure specific content was generated
      console.log('📝 Content Strategy headlines:', {
        primary: contentStrategy.headlines.primary,
        secondary: contentStrategy.headlines.secondary,
        email: contentStrategy.headlines.email
      });
      
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
    const routing = await this.routeRefinement(request);
    
    let updatedBrandSystem = request.previousOutputs?.brandSystem;
    let updatedContentStrategy = request.previousOutputs?.contentStrategy;
    let updatedEmail = request.currentEmail || '';
    let updatedLanding = request.currentLanding || '';
    let needsHtmlRegeneration = false;
    
    // Execute refinements for each agent in priority order
    for (const agentTask of routing.agents.sort((a, b) => a.priority - b.priority)) {
      switch (agentTask.name) {
        case 'brand':
          if (updatedBrandSystem) {
            updatedBrandSystem = await this.brandAgent.refineBrandSystem(
              updatedBrandSystem,
              agentTask.instructions,
              request.context
            );
            needsHtmlRegeneration = true; // Brand changes require HTML update
          }
          break;
          
        case 'content':
          if (updatedContentStrategy) {
            updatedContentStrategy = await this.contentAgent.refineContent(
              updatedContentStrategy,
              agentTask.instructions,
              request.context,
              updatedBrandSystem
            );
            needsHtmlRegeneration = true; // Content changes require HTML update
          }
          break;
          
        case 'technical':
          // Technical agent handles its own HTML updates
          if (updatedBrandSystem && updatedContentStrategy) {
            const technicalUpdate = await this.technicalAgent.refineWithContext({
              currentEmail: updatedEmail,
              currentLanding: updatedLanding,
              instructions: agentTask.instructions,
              brandSystem: updatedBrandSystem,
              contentStrategy: updatedContentStrategy,
              context: request.context,
              target: agentTask.target || 'both'
            });
            if (technicalUpdate.email) updatedEmail = technicalUpdate.email;
            if (technicalUpdate.landing) updatedLanding = technicalUpdate.landing;
            needsHtmlRegeneration = false; // Already handled
          }
          break;
          
        case 'all':
          // Complete regeneration with new instructions
          return this.coordinateGeneration({
            ...request.context,
            refinementInstructions: agentTask.instructions
          } as AgentContext);
      }
    }
    
    // If brand or content was updated but technical wasn't called, regenerate HTML
    if (needsHtmlRegeneration && updatedBrandSystem && updatedContentStrategy) {
      console.log('🔧 Regenerating HTML with updated brand/content...');
      
      // Detect target from the routing agents
      let regenerationTarget: 'email' | 'landing' | 'both' = 'both';
      const brandOrContentAgent = routing.agents.find(a => a.name === 'brand' || a.name === 'content');
      if (brandOrContentAgent?.target) {
        regenerationTarget = brandOrContentAgent.target;
      }
      
      const technicalUpdate = await this.technicalAgent.refineWithContext({
        currentEmail: updatedEmail,
        currentLanding: updatedLanding,
        instructions: request.userRequest, // Pass the original user request
        brandSystem: updatedBrandSystem,
        contentStrategy: updatedContentStrategy,
        context: request.context,
        target: regenerationTarget
      });
      
      if (technicalUpdate.email) updatedEmail = technicalUpdate.email;
      if (technicalUpdate.landing) updatedLanding = technicalUpdate.landing;
    }
    
    return {
      email: updatedEmail,
      landing: updatedLanding,
      metadata: {
        brandSystem: updatedBrandSystem || ({} as BrandSystem),
        contentStrategy: updatedContentStrategy || ({} as ContentStrategy),
        agentInsights: {
          refinementType: routing.refinementType,
          reasoning: routing.reasoning,
          agentsInvolved: routing.agents.map(a => a.name)
        },
        suggestedRefinements: []
      }
    };
  }
  
  private async routeRefinement(request: RefinementRequest): Promise<RefinementRouting> {
    const prompt = `You are an expert at understanding user feedback and routing it to the appropriate specialized agents. Analyze this request carefully and determine EXACTLY what the user wants changed.

    User Request: "${request.userRequest}"
    
    Current Campaign Context:
    - Product: ${request.context.formData?.product || 'Not specified'}
    - Audience: ${request.context.formData?.audience || 'Not specified'}
    - Purpose: ${request.context.formData?.purpose || 'Not specified'}
    - Tone: ${request.context.formData?.tone || 'Not specified'}
    - Theme: ${request.context.formData?.theme || 'Not specified'}
    - Has current email: ${!!request.currentEmail}
    - Has current landing: ${!!request.currentLanding}
    
    Current Brand System:
    ${request.previousOutputs?.brandSystem ? `
    - Colors: Primary=${request.previousOutputs.brandSystem?.colors?.primary || 'not set'}, Secondary=${request.previousOutputs.brandSystem?.colors?.secondary || 'not set'}, Text=${request.previousOutputs.brandSystem?.colors?.text || 'not set'}
    - Typography: Heading=${request.previousOutputs.brandSystem?.typography?.headingFont || 'not set'}, Body=${request.previousOutputs.brandSystem?.typography?.bodyFont || 'not set'}
    - Visual Style: ${request.previousOutputs.brandSystem?.visualStyle?.layoutStyle || 'not set'}
    ` : 'Not yet generated'}
    
    Current Content Strategy:
    ${request.previousOutputs?.contentStrategy ? `
    - Primary Headline: "${request.previousOutputs.contentStrategy?.headlines?.primary || 'not set'}"
    - Secondary Headline: "${request.previousOutputs.contentStrategy?.headlines?.secondary || 'not set'}"
    - Key Benefits: ${request.previousOutputs.contentStrategy?.body?.benefits?.join(', ') || 'not set'}
    - CTA: "${request.previousOutputs.contentStrategy?.cta?.primary || 'not set'}"
    ` : 'Not yet generated'}
    
    IMPORTANT ROUTING RULES:
    
    1. **BRAND AGENT** handles:
       - Color changes: "darker", "brighter", "more blue", "warmer", "cooler", specific hex codes
       - Font changes: "bigger", "smaller", "different font", "more readable", "bolder"
       - Spacing: "more space", "tighter", "breathing room", "cramped", "padding"
       - Visual style: "modern", "classic", "minimalist", "fancy", "simple"
       - Overall look: "professional", "playful", "serious", "fun", "corporate"
    
    2. **CONTENT AGENT** handles:
       - Headlines: "catchier", "shorter", "longer", "more exciting", "clearer"
       - Body text: "simpler", "more detail", "benefits", "features", "persuasive"
       - Tone: "friendlier", "formal", "casual", "urgent", "relaxed"
       - Messaging: "clearer value prop", "stronger CTA", "more emotional"
       - Specific text changes: "change X to Y", "add mention of Z"
    
    3. **TECHNICAL AGENT** handles:
       - Layout: "center the image", "left align", "right align", "move up/down"
       - Structure: "add section", "remove section", "reorder", "columns", "rows"
       - Image/Design placement: "bigger image", "smaller", "background", "hero section"
       - Responsiveness: "mobile friendly", "desktop optimized", "tablet view"
       - HTML structure: "add testimonials", "add FAQ", "add pricing table"
    
    4. **MULTIPLE AGENTS** for complex requests:
       - "Make it look like Apple" → brand (minimal colors), content (simple copy), technical (clean layout)
       - "Too corporate" → brand (warmer colors), content (friendlier tone), technical (less rigid layout)
       - "Doesn't pop" → brand (bolder colors), content (stronger headlines), technical (dynamic layout)
       - "Feels cheap" → brand (premium colors), content (sophisticated copy), technical (elegant structure)
    
    COMPREHENSIVE EXAMPLES:
    
    Visual/Design Requests:
    - "center the canva design" → technical: "Center the main design image in both email hero section and landing page hero"
    - "make the image bigger" → technical: "Increase the Canva design image size to be more prominent (at least 600px wide)"
    - "design should be on the left" → technical: "Move Canva design to left side with text on the right in a two-column layout"
    - "use the design as background" → technical: "Set Canva design as background image with overlay for text readability"
    - "less space around the image" → technical: "Reduce padding around the Canva design image from current spacing to 20px"
    
    Color/Style Requests:
    - "too bright" → brand: "Reduce color brightness by 20%, use more muted tones"
    - "needs more contrast" → brand: "Increase contrast between text (${request.previousOutputs?.brandSystem?.colors?.text}) and background"
    - "warmer feel" → brand: "Shift color palette towards warmer tones (reds, oranges, yellows)"
    - "more premium look" → brand: "Use darker, richer colors with gold accents, increase spacing"
    
    Content/Copy Requests:
    - "headline is boring" → content: "Make headline '${request.previousOutputs?.contentStrategy?.headlines?.primary}' more exciting and benefit-focused"
    - "too salesy" → content: "Reduce promotional language, focus on value and helping the customer"
    - "add urgency" → content: "Add time-sensitive language and scarcity elements to drive action"
    - "mention the price" → content: "Include pricing information prominently in the value proposition"
    
    Layout/Structure Requests:
    - "too cluttered" → technical: "Simplify layout with more whitespace, clearer sections"
    - "add testimonials" → technical: "Add a testimonials section with 3 customer quotes"
    - "mobile doesn't look good" → technical: "Optimize layout for mobile with single column and larger touch targets"
    - "want a video section" → technical: "Add video embed section below the hero area"
    
    Vague but Common Requests:
    - "doesn't feel right" → all: "Regenerate with better alignment to ${request.context.formData?.purpose}"
    - "make it pop" → brand: "Use bolder colors and stronger contrasts", content: "Use power words", technical: "Add visual hierarchy"
    - "too generic" → content: "Make copy specific to ${request.context.formData?.product}", brand: "Use unique color scheme"
    - "looks dated" → brand: "Modernize with current design trends", technical: "Update to contemporary layout patterns"
    
    TARGET DETECTION RULES:
    
    Determine if the user wants to change ONLY email, ONLY landing page, or BOTH:
    
    EMAIL ONLY indicators:
    - "email background", "email header", "email footer"
    - "in the email", "for the email", "email version"
    - "email template", "email design", "email layout"
    - "subject line" (always email only)
    
    LANDING PAGE ONLY indicators:
    - "landing page background", "landing page header", "LP"
    - "on the landing page", "for the landing page", "landing version"
    - "hero section" (usually landing page unless specified)
    - "website", "web page", "site"
    
    BOTH (default) indicators:
    - No specific mention of email or landing
    - "all", "everything", "both"
    - "the campaign", "the design", "the content"
    - General requests like "make it blue", "change the font"
    
    CRITICAL: 
    - Always provide SPECIFIC, ACTIONABLE instructions
    - Reference current values when asking for changes
    - If request is vague, make educated decisions based on campaign context
    - For positioning requests (center, left, right, etc), ALWAYS route to technical agent
    - For "design" mentions, determine if they mean the Canva image (technical) or overall design (brand)
    - ALWAYS specify target ('email', 'landing', or 'both') for each agent task
    
    Return your analysis with clear routing and instructions for each agent.`;
    
    const RefinementRoutingSchema = z.object({
      agents: z.array(z.object({
        name: z.enum(['brand', 'content', 'technical', 'all']),
        instructions: z.string(),
        priority: z.number(),
        target: z.enum(['email', 'landing', 'both']).optional()
      })),
      refinementType: z.string(),
      reasoning: z.string()
    });
    
    return this.generateStructured(prompt, RefinementRoutingSchema);
  }
  
  generateProactiveMessage(analysis: any): string {
    return `${analysis.proactiveMessage}

I spotted ways to make this even better:
${analysis.suggestedRefinements.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}

What would you like to focus on first, or does it look good to deploy?`;
  }
}