'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Loader2, Send, Rocket, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react'
import { useToast } from '@/app/src/hooks/use-toast'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface CampaignForm {
  product: string
  audience: string
  purpose: string
  tone: string
  theme: string
  templateType: 'standard' | 'scrollytelling'
  ctaEnabled: boolean
  ctaText: string
  ctaLink: string
  colorPreference?: string
  selectedPalette?: any
}

interface PaletteOption {
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  mood: string
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
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [colorPalettes, setColorPalettes] = useState<PaletteOption[]>([])
  const [isGeneratingPalettes, setIsGeneratingPalettes] = useState(false)
  const [formData, setFormData] = useState<CampaignForm>({
    product: '',
    audience: '',
    purpose: '',
    tone: 'professional',
    theme: 'modern',
    templateType: 'standard',
    ctaEnabled: true,
    ctaText: 'Get Started',
    ctaLink: '',
    colorPreference: '',
    selectedPalette: null
  })
  
  // Chat state
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [emailContent, setEmailContent] = useState<string>('')
  const [landingContent, setLandingContent] = useState<string>('')
  const [activeTab, setActiveTab] = useState('email')
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false)
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
  
  const generateColorPalettes = async () => {
    if (!formData.colorPreference) {
      toast({
        title: 'Color preference needed',
        description: 'Please describe your color preferences',
        variant: 'destructive'
      })
      return
    }
    
    setIsGeneratingPalettes(true)
    
    try {
      const response = await fetch('/api/ai/refine-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generatePalettes',
          colorDescription: formData.colorPreference,
          brandInfo: `${formData.product} for ${formData.audience}`
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error)
      
      setColorPalettes(data.palettes)
      setShowColorPicker(true)
      
    } catch (error) {
      toast({
        title: 'Failed to generate palettes',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setIsGeneratingPalettes(false)
    }
  }

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
    
    if (formData.ctaEnabled && !formData.ctaLink) {
      toast({
        title: 'Missing CTA link',
        description: 'Please provide a link for the CTA button',
        variant: 'destructive'
      })
      return
    }
    
    if (!formData.selectedPalette) {
      toast({
        title: 'No color palette selected',
        description: 'Please select a color palette for your campaign',
        variant: 'destructive'
      })
      return
    }
    
    setShowForm(false)
    setIsGenerating(true)
    
    // Create initial message from form data
    const formDescription = `I want to create a campaign for ${formData.product}. 
My target audience is ${formData.audience}. 
The purpose of this campaign is ${formData.purpose}.
I want a ${formData.tone} tone with a ${formData.theme} theme.
Use this color palette: ${formData.selectedPalette.name} - Primary: ${formData.selectedPalette.colors.primary}, Secondary: ${formData.selectedPalette.colors.secondary}, Accent: ${formData.selectedPalette.colors.accent}.
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
          selectedPalette: formData.selectedPalette,
          themeStyle: formData.theme,
          templateType: formData.templateType
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error)
      
      if (data.email) setEmailContent(data.email)
      if (data.landing) setLandingContent(data.landing)
      setHasGeneratedContent(true)
      
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
          selectedChannels
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error)
      
      if (data.email) setEmailContent(data.email)
      if (data.landing) setLandingContent(data.landing)
      
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
        templateType: formData.templateType,
        selectedPalette: formData.selectedPalette
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
      <div className="min-h-screen bg-background">
        <div className="container max-w-2xl mx-auto py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">Campaign Details</h1>
              <p className="text-sm text-muted-foreground">{campaignName}</p>
            </div>
          </div>
          
          <Card className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">What are you promoting? *</Label>
                <Textarea
                  id="product"
                  placeholder="e.g., Our new mobile app for task management"
                  value={formData.product}
                  onChange={(e) => setFormData(prev => ({ ...prev, product: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="audience">Who is your target audience? *</Label>
                <Input
                  id="audience"
                  placeholder="e.g., Busy professionals aged 25-45"
                  value={formData.audience}
                  onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purpose">What's the campaign purpose? *</Label>
                <Textarea
                  id="purpose"
                  placeholder="e.g., Get 1000 early users for our beta launch"
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  className="min-h-[60px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={formData.tone} onValueChange={(value) => setFormData(prev => ({ ...prev, tone: value }))}>
                    <SelectTrigger id="tone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="playful">Playful</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="theme">Visual Theme</Label>
                  <Select value={formData.theme} onValueChange={(value) => setFormData(prev => ({ ...prev, theme: value }))}>
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="retro">Retro</SelectItem>
                      <SelectItem value="elegant">Elegant</SelectItem>
                      <SelectItem value="tech">Tech/Futuristic</SelectItem>
                      <SelectItem value="playful">Playful/Colorful</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template">Landing Page Template</Label>
                  <Select value={formData.templateType} onValueChange={(value) => setFormData(prev => ({ ...prev, templateType: value as 'standard' | 'scrollytelling' }))}>
                    <SelectTrigger id="template">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Landing Page</SelectItem>
                      <SelectItem value="scrollytelling">Scrollytelling (Magical Journey)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {formData.templateType === 'scrollytelling' 
                      ? 'An immersive scrolling experience with animations and magical wizard theme' 
                      : 'A classic single-page design focused on conversion'}
                  </p>
                </div>
              </div>
              
              {/* Color Palette Section */}
              <div className="space-y-4 border rounded-lg p-4">
                <div className="space-y-2">
                  <Label htmlFor="color-preference">Color Preferences</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color-preference"
                      placeholder="e.g., warm and inviting, modern blue tones, earth colors..."
                      value={formData.colorPreference}
                      onChange={(e) => setFormData(prev => ({ ...prev, colorPreference: e.target.value }))}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={generateColorPalettes}
                      disabled={!formData.colorPreference || isGeneratingPalettes}
                      variant="secondary"
                    >
                      {isGeneratingPalettes ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Palettes
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Describe your ideal colors and we'll generate options</p>
                </div>
                
                {/* Color Palette Options */}
                {colorPalettes.length > 0 && (
                  <div className="space-y-3">
                    <Label>Select a Color Palette</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {colorPalettes.map((palette, idx) => (
                        <div
                          key={idx}
                          className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                            formData.selectedPalette?.name === palette.name
                              ? 'border-primary ring-2 ring-primary ring-offset-2'
                              : 'hover:border-gray-400'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, selectedPalette: palette }))}
                        >
                          <div className="space-y-2">
                            <div className="font-medium">{palette.name}</div>
                            <div className="text-xs text-muted-foreground">{palette.description}</div>
                            <div className="flex gap-1 h-8">
                              <div
                                className="flex-1 rounded"
                                style={{ backgroundColor: palette.colors.primary }}
                                title="Primary"
                              />
                              <div
                                className="flex-1 rounded"
                                style={{ backgroundColor: palette.colors.secondary }}
                                title="Secondary"
                              />
                              <div
                                className="flex-1 rounded"
                                style={{ backgroundColor: palette.colors.accent }}
                                title="Accent"
                              />
                            </div>
                            <div className="text-xs text-muted-foreground italic">
                              Mood: {palette.mood}
                            </div>
                          </div>
                          {formData.selectedPalette?.name === palette.name && (
                            <div className="absolute top-2 right-2">
                              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4 border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="cta-toggle">Call-to-Action Button</Label>
                    <p className="text-sm text-muted-foreground">Include a CTA button in your content</p>
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
                      <Label htmlFor="cta-text">Button Text</Label>
                      <Input
                        id="cta-text"
                        placeholder="e.g., Get Started"
                        value={formData.ctaText}
                        onChange={(e) => setFormData(prev => ({ ...prev, ctaText: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cta-link">Button Link *</Label>
                      <Input
                        id="cta-link"
                        placeholder="https://yoursite.com/signup"
                        value={formData.ctaLink}
                        onChange={(e) => setFormData(prev => ({ ...prev, ctaLink: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button onClick={handleFormSubmit}>
                  Generate Campaign
                  <ArrowRight className="ml-2 h-4 w-4" />
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
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowForm(true)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">Customize Campaign</h1>
              <p className="text-sm text-muted-foreground">{campaignName}</p>
            </div>
          </div>
          <Button 
            onClick={handleLaunchCampaign} 
            disabled={!hasGeneratedContent || isCreatingCampaign}
            size="lg"
          >
            {isCreatingCampaign ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4 mr-2" />
                Launch Campaign
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col border-r">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Campaign Assistant
            </h2>
          </div>
          
          <ScrollArea className="flex-1 px-6">
            <div className="py-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-lg max-w-[70%] ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="text-left">
                  <div className="inline-block p-3 rounded-lg bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>
          
          <div className="p-6 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={hasGeneratedContent ? "Ask me to make changes..." : "Generating content..."}
                disabled={isGenerating || !hasGeneratedContent}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isGenerating || !input.trim() || !hasGeneratedContent}
                size="icon"
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
        <div className="flex-1 flex flex-col bg-muted/30">
          <div className="px-6 py-4 border-b bg-background">
            <h2 className="font-semibold flex items-center gap-2">
              Preview
              {hasGeneratedContent && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Ready
                </span>
              )}
            </h2>
          </div>
          
          <div className="flex-1 p-6">
            <Card className="h-full overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2 m-1">
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="landing">Landing Page</TabsTrigger>
                </TabsList>
                
                <TabsContent value="email" className="flex-1 m-0 p-1">
                  {emailContent ? (
                    <iframe
                      srcDoc={emailContent}
                      className="w-full h-full border-0 rounded-b-lg"
                      title="Email Preview"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="landing" className="flex-1 m-0 p-1">
                  {landingContent ? (
                    <iframe
                      srcDoc={landingContent}
                      className="w-full h-full border-0 rounded-b-lg"
                      title="Landing Page Preview"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin" />
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