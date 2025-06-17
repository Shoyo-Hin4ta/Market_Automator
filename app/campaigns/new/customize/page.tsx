'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CustomDropdown } from '@/app/components/ui/CustomDropdown'
import { Switch } from '@/components/ui/switch'
import { Loader2, Send, Rocket, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react'
import { useToast } from '@/app/hooks/use-toast'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import '@/app/styles/magical-theme.css'

interface CampaignForm {
  product: string
  audience: string
  purpose: string
  tone: string
  theme: string
  ctaEnabled: boolean
  ctaText: string
  ctaLink: string
  selectedColors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  aiDecideColors: boolean
  colorMode: 'ai' | 'describe' | 'manual'
  colorThemeDescription: string
}

export default function CustomizeCampaignPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const campaignName = searchParams.get('name') || ''
  const designId = searchParams.get('design') || ''
  const designUrl = searchParams.get('designUrl') || ''
  const selectedChannels = searchParams.get('channels')?.split(',') || []
  
  // Get full design data from sessionStorage
  const [selectedDesign, setSelectedDesign] = useState<any>(null)
  
  useEffect(() => {
    const designData = sessionStorage.getItem('currentDesign')
    if (designData) {
      setSelectedDesign(JSON.parse(designData))
    }
  }, [])
  
  // Form state
  const [showForm, setShowForm] = useState(true)
  const [isCardHovered, setIsCardHovered] = useState(false)
  const [dropdownStates, setDropdownStates] = useState<{[key: string]: {isOpen: boolean, isHovered: boolean}}>({
    tone: { isOpen: false, isHovered: false },
    theme: { isOpen: false, isHovered: false }
  })
  
  // Check if any dropdown is open and hovered
  const isAnyDropdownHovered = Object.values(dropdownStates).some(state => state.isOpen && state.isHovered)
  
  // Combined hover state - card is "hovered" if card itself is hovered OR any dropdown is hovered
  const effectiveHoverState = isCardHovered || isAnyDropdownHovered
  
  // Helper functions for dropdown state management
  const handleDropdownOpen = (dropdownId: string, isOpen: boolean) => {
    setDropdownStates(prev => ({
      ...prev,
      [dropdownId]: { ...prev[dropdownId], isOpen }
    }))
  }
  
  const handleDropdownHover = (dropdownId: string, isHovered: boolean) => {
    setDropdownStates(prev => ({
      ...prev,
      [dropdownId]: { ...prev[dropdownId], isHovered }
    }))
  }
  
  const [formData, setFormData] = useState<CampaignForm>({
    product: '',
    audience: '',
    purpose: '',
    tone: 'professional',
    theme: 'modern',
    ctaEnabled: true,
    ctaText: 'Get Started',
    ctaLink: '',
    selectedColors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#F59E0B',
      background: '#F3F4F6',
      text: '#111827'
    },
    aiDecideColors: false,
    colorMode: 'manual',
    colorThemeDescription: ''
  })
  
  // Chat state
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [emailContent, setEmailContent] = useState<string>('')
  const [landingContent, setLandingContent] = useState<string>('')
  const [activeTab, setActiveTab] = useState('email')
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false)
  const [agentMetadata, setAgentMetadata] = useState<any>(null)
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (!showForm) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [messages, showForm])
  

  const handleFormSubmit = async () => {
    // Validate form
    if (!formData.product || !formData.audience || !formData.purpose) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }
    
    if (formData.colorMode === 'describe' && !formData.colorThemeDescription.trim()) {
      toast({
        title: 'Missing color theme',
        description: 'Please describe your desired color theme',
        variant: 'destructive'
      })
      return
    }
    
    if (formData.ctaEnabled && !formData.ctaLink) {
      toast({
        title: 'Missing CTA link',
        description: 'Please provide a link for the CTA button',
        variant: 'destructive'
      })
      return
    }
    
    
    setShowForm(false)
    setIsGenerating(true)
    
    // Create initial message from form data
    let colorInstruction = '';
    if (formData.colorMode === 'ai') {
      colorInstruction = 'Please select appropriate colors that match this campaign.';
    } else if (formData.colorMode === 'describe') {
      colorInstruction = `Please create a color palette based on this theme: ${formData.colorThemeDescription}.`;
    } else {
      colorInstruction = `Use these colors: Primary: ${formData.selectedColors.primary}, Secondary: ${formData.selectedColors.secondary}, Accent: ${formData.selectedColors.accent}.`;
    }
    
    const formDescription = `I want to create a campaign for ${formData.product}. 
My target audience is ${formData.audience}. 
The purpose of this campaign is ${formData.purpose}.
I want a ${formData.tone} tone with a ${formData.theme} theme.
${colorInstruction}
${formData.ctaEnabled ? `Include a CTA button "${formData.ctaText}" linking to ${formData.ctaLink}` : 'No CTA buttons needed.'}`
    
    setMessages([
      { role: 'user', content: formDescription },
      { role: 'assistant', content: 'Perfect! I have all the information I need. Let me create your campaign content...' }
    ])
    
    try {
      const response = await fetch('/api/ai/refine-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignName,
          designUrl,
          messages: [{ role: 'user', content: formDescription }],
          currentEmail: '',
          currentLanding: '',
          selectedChannels,
          skipAnalysis: true, // Skip the analysis since we have all info from form
          selectedColors: formData.colorMode === 'manual' ? formData.selectedColors : undefined,
          themeStyle: formData.theme,
          aiDecideColors: formData.colorMode === 'ai',
          colorMode: formData.colorMode,
          colorThemeDescription: formData.colorThemeDescription
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error)
      
      if (data.email) setEmailContent(data.email)
      if (data.landing) setLandingContent(data.landing)
      setHasGeneratedContent(true)
      
      // Store agent metadata and form data
      if (data.context?.metadata) {
        setAgentMetadata(data.context.metadata)
      }
      // Store form data if returned (for refinement context)
      if (data.context?.formData) {
        setFormData(prev => ({
          ...prev,
          ...data.context.formData,
          selectedColors: data.context.formData.selectedColors || prev.selectedColors
        }))
      }
      
      // Update colors if AI generated them
      if (data.generatedColors) {
        setFormData(prev => ({
          ...prev,
          selectedColors: data.generatedColors,
          colorMode: 'manual' // Switch to manual mode after generation to show the colors
        }))
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message + '\n\nFeel free to ask me to make any changes or improvements!'
      }])
      
      // Switch to appropriate preview tab
      setActiveTab(selectedChannels.includes('email') ? 'email' : 'landing')
      
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.'
      }])
      setShowForm(true)
    } finally {
      setIsGenerating(false)
    }
  }
  
  const handleSendMessage = async () => {
    if (!input.trim() || isGenerating) return
    
    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/ai/refine-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignName,
          designUrl,
          messages: [...messages, { role: 'user', content: userMessage }],
          currentEmail: emailContent,
          currentLanding: landingContent,
          selectedChannels,
          previousOutputs: agentMetadata ? {
            brandSystem: agentMetadata.brandSystem,
            contentStrategy: agentMetadata.contentStrategy,
            formData: formData,
            technicalImplementation: {
              emailHtml: emailContent,
              landingHtml: landingContent
            }
          } : undefined
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error)
      
      if (data.email) setEmailContent(data.email)
      if (data.landing) setLandingContent(data.landing)
      
      // Update agent metadata if returned
      if (data.context?.metadata) {
        setAgentMetadata(data.context.metadata)
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message
      }])
      
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }
  
  const handleLaunchCampaign = async () => {
    if (!emailContent && selectedChannels.includes('email')) {
      toast({
        title: 'Missing content',
        description: 'Please generate email content first',
        variant: 'destructive'
      })
      return
    }
    
    setIsCreatingCampaign(true)
    
    try {
      const aiContent = {
        email: emailContent ? { html: emailContent } : null,
        landing: landingContent ? { html: landingContent } : null,
        selectedColors: formData.selectedColors
      }
      
      const response = await fetch('/api/campaigns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName,
          canva_design_id: designId,
          canva_design_url: selectedDesign?.urls?.view_url,
          canva_thumbnail_url: designUrl,
          selected_channels: selectedChannels,
          ai_content: aiContent
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        console.error('Campaign creation error:', data)
        throw new Error(data.error || 'Failed to create campaign')
      }
      
      console.log('Campaign created successfully:', data)
      
      toast({
        title: 'Campaign created!',
        description: 'Your campaign is being distributed...'
      })
      
      // Clear session storage
      sessionStorage.removeItem('selectedDesign')
      sessionStorage.removeItem('currentDesign')
      
      // Redirect to campaigns list page
      router.push('/campaigns')
      
    } catch (error) {
      toast({
        title: 'Failed to create campaign',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setIsCreatingCampaign(false)
    }
  }
  
  // Show form view
  if (showForm) {
    return (
      <div className="min-h-screen page-gradient">
        <div className="container max-w-2xl mx-auto py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-yellow-600/10 hover:text-yellow-500"
            >
              <ArrowLeft className="h-4 w-4 text-gray-300" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold shimmer-text">Campaign Details</h1>
              <p className="text-sm text-gray-400">{campaignName}</p>
            </div>
          </div>
          
          <Card 
            className="p-6 card-magical"
            onMouseEnter={() => setIsCardHovered(true)}
            onMouseLeave={() => setIsCardHovered(false)}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300" htmlFor="product">What are you promoting? *</Label>
                <Textarea
                  id="product"
                  placeholder="e.g., Our new mobile app for task management"
                  value={formData.product}
                  onChange={(e) => setFormData(prev => ({ ...prev, product: e.target.value }))}
                  className="min-h-[80px] textarea-magical"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300" htmlFor="audience">Who is your target audience? *</Label>
                <Input
                  id="audience"
                  placeholder="e.g., Busy professionals aged 25-45"
                  value={formData.audience}
                  onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value }))}
                  className="input-magical"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300" htmlFor="purpose">What's the campaign purpose? *</Label>
                <Textarea
                  id="purpose"
                  placeholder="e.g., Get 1000 early users for our beta launch"
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  className="min-h-[60px] textarea-magical"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300" htmlFor="tone">Tone</Label>
                  <CustomDropdown
                    value={formData.tone}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tone: value }))}
                    options={[
                      { value: 'professional', label: 'Professional' },
                      { value: 'casual', label: 'Casual' },
                      { value: 'playful', label: 'Playful' },
                      { value: 'urgent', label: 'Urgent' },
                      { value: 'friendly', label: 'Friendly' }
                    ]}
                    width="100%"
                    parentHovered={effectiveHoverState}
                    onDropdownHover={(isHovered) => handleDropdownHover('tone', isHovered)}
                    onOpenChange={(isOpen) => handleDropdownOpen('tone', isOpen)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-300" htmlFor="theme">Visual Theme</Label>
                  <CustomDropdown
                    value={formData.theme}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, theme: value }))}
                    options={[
                      { value: 'modern', label: 'Modern' },
                      { value: 'minimal', label: 'Minimal' },
                      { value: 'bold', label: 'Bold' },
                      { value: 'retro', label: 'Retro' },
                      { value: 'elegant', label: 'Elegant' },
                      { value: 'tech', label: 'Tech/Futuristic' },
                      { value: 'playful', label: 'Playful/Colorful' }
                    ]}
                    width="100%"
                    parentHovered={effectiveHoverState}
                    onDropdownHover={(isHovered) => handleDropdownHover('theme', isHovered)}
                    onOpenChange={(isOpen) => handleDropdownOpen('theme', isOpen)}
                  />
                </div>
              </div>
              
              {/* Color Selection Section */}
              <div className="space-y-4 border rounded-lg p-4 magical-border">
                <div className="mb-4">
                  <Label className="text-gray-300 mb-3 block">Brand Colors</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="radio"
                          name="colorMode"
                          value="ai"
                          checked={formData.colorMode === 'ai'}
                          onChange={() => setFormData(prev => ({ ...prev, colorMode: 'ai', aiDecideColors: true }))}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border transition-all ${
                          formData.colorMode === 'ai' 
                            ? 'border-yellow-500 bg-yellow-500/20' 
                            : 'border-gray-600 bg-transparent'
                        }`}>
                          {formData.colorMode === 'ai' && (
                            <div className="w-2 h-2 bg-yellow-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-300 group-hover:text-yellow-500 transition-colors">Let AI Decide</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="radio"
                          name="colorMode"
                          value="describe"
                          checked={formData.colorMode === 'describe'}
                          onChange={() => setFormData(prev => ({ ...prev, colorMode: 'describe', aiDecideColors: false }))}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border transition-all ${
                          formData.colorMode === 'describe' 
                            ? 'border-yellow-500 bg-yellow-500/20' 
                            : 'border-gray-600 bg-transparent'
                        }`}>
                          {formData.colorMode === 'describe' && (
                            <div className="w-2 h-2 bg-yellow-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-300 group-hover:text-yellow-500 transition-colors">Describe Theme</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="radio"
                          name="colorMode"
                          value="manual"
                          checked={formData.colorMode === 'manual'}
                          onChange={() => setFormData(prev => ({ ...prev, colorMode: 'manual', aiDecideColors: false }))}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border transition-all ${
                          formData.colorMode === 'manual' 
                            ? 'border-yellow-500 bg-yellow-500/20' 
                            : 'border-gray-600 bg-transparent'
                        }`}>
                          {formData.colorMode === 'manual' && (
                            <div className="w-2 h-2 bg-yellow-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-300 group-hover:text-yellow-500 transition-colors">Choose Colors</span>
                    </label>
                  </div>
                </div>
                
                {/* Color Theme Description Input */}
                {formData.colorMode === 'describe' && (
                  <div className="space-y-2">
                    <Label htmlFor="color-theme" className="text-sm text-gray-400">Describe your color theme</Label>
                    <Input
                      id="color-theme"
                      placeholder="e.g., warm sunset tones, corporate blue and gray, vibrant red and orange"
                      value={formData.colorThemeDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, colorThemeDescription: e.target.value }))}
                      className="input-magical"
                    />
                  </div>
                )}
                
                <div className={`grid grid-cols-2 gap-4 ${formData.colorMode !== 'manual' ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-400">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-10 h-10 rounded border border-gray-600 cursor-pointer hover:border-yellow-500 transition-colors"
                        style={{ backgroundColor: formData.selectedColors.primary }}
                        onClick={() => {
                          const input = document.getElementById('primary-color-input') as HTMLInputElement;
                          input?.click();
                        }}
                      />
                      <Input
                        id="primary-color-input"
                        type="color"
                        value={formData.selectedColors.primary}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          selectedColors: { ...prev.selectedColors, primary: e.target.value }
                        }))}
                        className="sr-only"
                        disabled={formData.colorMode !== 'manual'}
                      />
                      <Input
                        value={formData.selectedColors.primary}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          selectedColors: { ...prev.selectedColors, primary: e.target.value }
                        }))}
                        placeholder="#3B82F6"
                        className="input-magical"
                        disabled={formData.colorMode !== 'manual'}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-400">Secondary Color</Label>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-10 h-10 rounded border border-gray-600 cursor-pointer hover:border-yellow-500 transition-colors"
                        style={{ backgroundColor: formData.selectedColors.secondary }}
                        onClick={() => {
                          const input = document.getElementById('secondary-color-input') as HTMLInputElement;
                          input?.click();
                        }}
                      />
                      <Input
                        id="secondary-color-input"
                        type="color"
                        value={formData.selectedColors.secondary}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          selectedColors: { ...prev.selectedColors, secondary: e.target.value }
                        }))}
                        className="sr-only"
                        disabled={formData.colorMode !== 'manual'}
                      />
                      <Input
                        value={formData.selectedColors.secondary}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          selectedColors: { ...prev.selectedColors, secondary: e.target.value }
                        }))}
                        placeholder="#8B5CF6"
                        className="input-magical"
                        disabled={formData.colorMode !== 'manual'}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-400">Accent Color</Label>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-10 h-10 rounded border border-gray-600 cursor-pointer hover:border-yellow-500 transition-colors"
                        style={{ backgroundColor: formData.selectedColors.accent }}
                        onClick={() => {
                          const input = document.getElementById('accent-color-input') as HTMLInputElement;
                          input?.click();
                        }}
                      />
                      <Input
                        id="accent-color-input"
                        type="color"
                        value={formData.selectedColors.accent}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          selectedColors: { ...prev.selectedColors, accent: e.target.value }
                        }))}
                        className="sr-only"
                        disabled={formData.colorMode !== 'manual'}
                      />
                      <Input
                        value={formData.selectedColors.accent}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          selectedColors: { ...prev.selectedColors, accent: e.target.value }
                        }))}
                        placeholder="#F59E0B"
                        className="input-magical"
                        disabled={formData.colorMode !== 'manual'}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-400">Background Color</Label>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-10 h-10 rounded border border-gray-600 cursor-pointer hover:border-yellow-500 transition-colors"
                        style={{ backgroundColor: formData.selectedColors.background }}
                        onClick={() => {
                          const input = document.getElementById('background-color-input') as HTMLInputElement;
                          input?.click();
                        }}
                      />
                      <Input
                        id="background-color-input"
                        type="color"
                        value={formData.selectedColors.background}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          selectedColors: { ...prev.selectedColors, background: e.target.value }
                        }))}
                        className="sr-only"
                        disabled={formData.colorMode !== 'manual'}
                      />
                      <Input
                        value={formData.selectedColors.background}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          selectedColors: { ...prev.selectedColors, background: e.target.value }
                        }))}
                        placeholder="#F3F4F6"
                        className="input-magical"
                        disabled={formData.colorMode !== 'manual'}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-400">Text Color</Label>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-10 h-10 rounded border border-gray-600 cursor-pointer hover:border-yellow-500 transition-colors"
                        style={{ backgroundColor: formData.selectedColors.text }}
                        onClick={() => {
                          const input = document.getElementById('text-color-input') as HTMLInputElement;
                          input?.click();
                        }}
                      />
                      <Input
                        id="text-color-input"
                        type="color"
                        value={formData.selectedColors.text}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          selectedColors: { ...prev.selectedColors, text: e.target.value }
                        }))}
                        className="sr-only"
                        disabled={formData.colorMode !== 'manual'}
                      />
                      <Input
                        value={formData.selectedColors.text}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          selectedColors: { ...prev.selectedColors, text: e.target.value }
                        }))}
                        placeholder="#111827"
                        className="input-magical"
                        disabled={formData.colorMode !== 'manual'}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 border rounded-lg p-4 magical-border">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-gray-300" htmlFor="cta-toggle">Call-to-Action Button</Label>
                    <p className="text-sm text-gray-400">Include a CTA button in your content</p>
                  </div>
                  <Switch
                    id="cta-toggle"
                    checked={formData.ctaEnabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ctaEnabled: checked }))}
                  />
                </div>
                
                {formData.ctaEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300" htmlFor="cta-text">Button Text</Label>
                      <Input
                        id="cta-text"
                        placeholder="e.g., Get Started"
                        value={formData.ctaText}
                        onChange={(e) => setFormData(prev => ({ ...prev, ctaText: e.target.value }))}
                        className="input-magical"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300" htmlFor="cta-link">Button Link *</Label>
                      <Input
                        id="cta-link"
                        placeholder="https://yoursite.com/signup"
                        value={formData.ctaLink}
                        onChange={(e) => setFormData(prev => ({ ...prev, ctaLink: e.target.value }))}
                        className="input-magical"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => router.back()} className="btn-magical border-gray-600 hover:border-yellow-600">
                  Cancel
                </Button>
                <Button onClick={handleFormSubmit} className="btn-magical bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white ">
                  Generate Campaign
                  <ArrowRight className="ml-2 h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }
  
  // Show customization view
  return (
    <div className="h-screen flex flex-col page-gradient">
      {/* Header */}
      <div className="border-b px-6 py-4 magical-border bg-magical-dark">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowForm(true)}
              className="hover:bg-yellow-600/10 hover:text-yellow-500"
            >
              <ArrowLeft className="h-4 w-4 text-gray-300" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold shimmer-text">Customize Campaign</h1>
              <p className="text-sm text-gray-400">{campaignName}</p>
            </div>
          </div>
          <Button 
            onClick={handleLaunchCampaign} 
            disabled={!hasGeneratedContent || isCreatingCampaign}
            size="lg"
            className="btn-magical bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-semibold"
          >
            {isCreatingCampaign ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4 mr-2 text-white" />
                <span className='text-white'>Launch Campaign</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col border-r magical-border overflow-hidden">
          <div className="px-6 py-4 border-b magical-border bg-magical-dark flex-shrink-0">
            <h2 className="font-semibold flex items-center gap-2 text-gray-200">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              AI Campaign Assistant
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto px-6">
            <div className="py-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-lg max-w-[70%] bg-magical-dark magical-border ${
                    msg.role === 'user' ? 'ml-auto' : ''
                  }`}>
                    <p className="text-sm whitespace-pre-wrap text-gray-200">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="text-left">
                  <div className="inline-block p-3 rounded-lg bg-magical-dark border border-gray-700">
                    <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>
          
          <div className="p-6 border-t magical-border bg-magical-dark flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={hasGeneratedContent ? "Ask me to make changes..." : "Generating content..."}
                disabled={isGenerating || !hasGeneratedContent}
                className="flex-1 input-magical"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isGenerating || !input.trim() || !hasGeneratedContent}
                size="icon"
                className="btn-magical bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Preview Section */}
        <div className="flex-1 flex flex-col bg-magical-dark overflow-hidden">
          <div className="px-6 py-4 border-b magical-border bg-magical-dark flex-shrink-0">
            <h2 className="font-semibold flex items-center gap-2 text-gray-200">
              Preview
              {hasGeneratedContent && (
                <span className="text-xs bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full border border-yellow-600/40">
                  Ready
                </span>
              )}
            </h2>
          </div>
          
          <div className="flex-1 p-6 overflow-hidden flex flex-col">
            <Card className="h-full overflow-hidden card-magical flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2 gap-2 p-1 flex-shrink-0" style={{ background: 'rgba(26, 8, 39, 0.6)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '0.5rem', boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)' }}>
                  <TabsTrigger value="email" className="tab-magical">Email</TabsTrigger>
                  <TabsTrigger value="landing" className="tab-magical">Landing Page</TabsTrigger>
                </TabsList>
                
                <TabsContent value="email" className="flex-1 m-0 p-1 overflow-hidden">
                  {emailContent ? (
                    <iframe
                      srcDoc={emailContent}
                      className="w-full h-full border-0 rounded-b-lg"
                      title="Email Preview"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="landing" className="flex-1 m-0 p-1 overflow-hidden">
                  {landingContent ? (
                    <iframe
                      srcDoc={landingContent}
                      className="w-full h-full border-0 rounded-b-lg"
                      title="Landing Page Preview"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}