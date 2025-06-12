'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useRouter } from 'next/navigation'
import { ArrowLeft, AlertCircle, Rocket, Mail, FileText, Github, Loader2 } from 'lucide-react'
import { useToast } from '@/app/src/hooks/use-toast'
import { useIntegrations } from '@/app/src/hooks/useIntegrations'
import { useAIContent } from '@/app/src/hooks/useAIContent'

export default function NewCampaignPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { integrations, loading: integrationsLoading } = useIntegrations()
  const { generateEmail, generateLandingPage, loading: aiLoading } = useAIContent()
  
  const [selectedDesign, setSelectedDesign] = useState<any>(null)
  const [campaignName, setCampaignName] = useState('')
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [isGeneratingContent, setIsGeneratingContent] = useState(false)
  const [aiContent, setAiContent] = useState<any>(null)
  
  // Determine available channels based on connected integrations
  const availableChannels = [
    { id: 'email', name: 'Email (Mailchimp)', icon: Mail, service: 'mailchimp' },
    { id: 'notion', name: 'Notion', icon: FileText, service: 'notion' },
    { id: 'github', name: 'GitHub Pages', icon: Github, service: 'github' }
  ].filter(channel => integrations[channel.service as keyof typeof integrations])
  
  useEffect(() => {
    // Get the selected design from sessionStorage
    const designData = sessionStorage.getItem('selectedDesign')
    if (designData) {
      const design = JSON.parse(designData)
      setSelectedDesign(design)
      setCampaignName(design.title || 'New Campaign')
    }
  }, [])
  
  useEffect(() => {
    // Auto-select all available channels after integrations are loaded
    if (!integrationsLoading) {
      setSelectedChannels(availableChannels.map(c => c.id))
    }
  }, [integrationsLoading])
  
  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    )
  }
  
  const handleGenerateContent = async () => {
    if (!selectedDesign || !campaignName) return
    
    setIsGeneratingContent(true)
    const content: any = {}
    
    try {
      // Generate email content if email channel is selected
      if (selectedChannels.includes('email')) {
        const emailContent = await generateEmail({
          campaignName,
          designUrl: selectedDesign.thumbnail?.url,
          tone: 'professional'
        })
        
        content.email = {
          subject: emailContent.subject,
          preview: emailContent.preview,
          html: emailContent.html,
          from_name: 'Marketing Team'
        }
      }
      
      // Generate landing page content if GitHub is selected
      if (selectedChannels.includes('github')) {
        const landingContent = await generateLandingPage({
          campaignName,
          designUrl: selectedDesign.thumbnail?.url,
          tone: 'professional'
        })
        
        content.landing_page = {
          title: landingContent.title,
          html: landingContent.html
        }
      }
      
      setAiContent(content)
      
      toast({
        title: 'Content generated!',
        description: 'AI has generated optimized content for your campaign.',
      })
    } catch (error) {
      toast({
        title: 'Failed to generate content',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setIsGeneratingContent(false)
    }
  }
  
  const handleCreateCampaign = async () => {
    if (!selectedDesign || !campaignName || selectedChannels.length === 0) return
    
    setIsCreating(true)
    try {
      const response = await fetch('/api/campaigns/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: campaignName,
          canva_design_id: selectedDesign.id,
          canva_design_url: selectedDesign.urls?.view_url || `https://www.canva.com/design/${selectedDesign.id}/view`,
          canva_thumbnail_url: selectedDesign.thumbnail?.url,
          selected_channels: selectedChannels,
          ai_content: aiContent
        })
      })
      
      if (!response.ok) throw new Error('Failed to create campaign')
      
      const data = await response.json()
      
      // Show warnings if any
      if (data.warnings && data.warnings.length > 0) {
        data.warnings.forEach((warning: string) => {
          toast({
            title: 'Warning',
            description: warning,
            variant: 'destructive'
          })
        })
      }
      
      toast({
        title: 'Campaign created!',
        description: 'Your campaign has been created and distributed to selected channels.',
      })
      
      // Clear selected design and navigate to campaigns
      sessionStorage.removeItem('selectedDesign')
      router.push('/campaigns')
    } catch (error) {
      toast({
        title: 'Failed to create campaign',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setIsCreating(false)
    }
  }
  
  if (integrationsLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }
  
  if (availableChannels.length === 0) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No integrations connected</AlertTitle>
          <AlertDescription>
            Please connect at least one integration (Mailchimp, Notion, or GitHub) in Settings before creating campaigns.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push('/settings')}>
            Go to Settings
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Campaign</h1>
          <p className="text-muted-foreground">
            Distribute your design across multiple channels
          </p>
        </div>
      </div>
      
      <div className="grid gap-6">
        {selectedDesign && (
          <Card>
            <CardHeader>
              <CardTitle>Selected Design</CardTitle>
              <CardDescription>You selected this design for your campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-start">
                <img
                  src={selectedDesign.thumbnail?.url}
                  alt={selectedDesign.title}
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-medium">{selectedDesign.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Design ID: {selectedDesign.id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>Configure your campaign settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Enter campaign name"
                className="mt-1"
              />
            </div>
            
            <div className="space-y-3">
              <Label>Distribution Channels</Label>
              <p className="text-sm text-muted-foreground">
                Select where you want to distribute your campaign
              </p>
              {availableChannels.map((channel) => {
                const Icon = channel.icon
                return (
                  <div key={channel.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={channel.id}
                      checked={selectedChannels.includes(channel.id)}
                      onCheckedChange={() => handleChannelToggle(channel.id)}
                    />
                    <label
                      htmlFor={channel.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Icon className="h-4 w-4" />
                      {channel.name}
                    </label>
                  </div>
                )
              })}
            </div>
            
            {integrations.openai && selectedChannels.length > 0 && (
              <div className="space-y-3">
                <Label>AI Content Generation</Label>
                <p className="text-sm text-muted-foreground">
                  Generate optimized content for your campaign using AI
                </p>
                <Button
                  variant="outline"
                  onClick={handleGenerateContent}
                  disabled={isGeneratingContent || !selectedDesign}
                >
                  {isGeneratingContent ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Content'
                  )}
                </Button>
                {aiContent && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      AI content generated successfully! The content will be automatically applied when you create the campaign.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
          <Button 
            onClick={handleCreateCampaign} 
            disabled={!selectedDesign || !campaignName || selectedChannels.length === 0 || isCreating}
          >
            <Rocket className="w-4 h-4 mr-2" />
            {isCreating ? "Creating..." : "Create Campaign"}
          </Button>
        </div>
      </div>
    </div>
  )
}