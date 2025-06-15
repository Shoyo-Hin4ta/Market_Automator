'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useRouter } from 'next/navigation'
import { ArrowLeft, AlertCircle, Rocket, Mail, FileText, Github } from 'lucide-react'
import { useToast } from '@/app/hooks/use-toast'
import { useIntegrations } from '@/app/hooks/useIntegrations'
import '@/app/styles/magical-theme.css'

export default function NewCampaignPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { integrations, loading: integrationsLoading } = useIntegrations()
  
  const [selectedDesign, setSelectedDesign] = useState<any>(null)
  const [campaignName, setCampaignName] = useState('')
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  
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
  
  const handleCustomizeCampaign = () => {
    if (!selectedDesign || !campaignName || selectedChannels.length === 0) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }
    
    // Navigate to the customize page with parameters
    const params = new URLSearchParams({
      name: campaignName,
      design: selectedDesign.id,
      designUrl: selectedDesign.thumbnail?.url || '',
      channels: selectedChannels.join(',')
    })
    
    // Store full design data in sessionStorage for the customize page
    sessionStorage.setItem('currentDesign', JSON.stringify(selectedDesign))
    
    router.push(`/campaigns/new/customize?${params.toString()}`)
  }
  
  
  if (integrationsLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-md skeleton-magical" />
          <div>
            <div className="h-8 w-64 mb-2 rounded skeleton-magical" />
            <div className="h-5 w-96 rounded skeleton-magical" />
          </div>
        </div>
        
        <div className="grid gap-6">
          {/* Selected Design Skeleton */}
          <Card className="card-magical">
            <CardHeader>
              <div className="h-6 w-32 mb-2 rounded skeleton-magical" />
              <div className="h-4 w-64 rounded skeleton-magical" />
            </CardHeader>
            <CardContent style={{ background: 'transparent' }}>
              <div className="flex gap-4 items-start">
                <div className="w-32 h-32 rounded-lg skeleton-magical" />
                <div className="flex-1">
                  <div className="h-5 w-48 mb-2 rounded skeleton-magical" />
                  <div className="h-4 w-32 rounded skeleton-magical" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Campaign Details Skeleton */}
          <Card className="card-magical">
            <CardHeader>
              <div className="h-6 w-40 mb-2 rounded skeleton-magical" />
              <div className="h-4 w-56 rounded skeleton-magical" />
            </CardHeader>
            <CardContent className="space-y-6" style={{ background: 'transparent' }}>
              <div>
                <div className="h-4 w-32 mb-2 rounded skeleton-magical" />
                <div className="h-10 w-full rounded skeleton-magical" />
              </div>
              
              <div className="space-y-3">
                <div className="h-4 w-40 mb-2 rounded skeleton-magical" />
                <div className="h-4 w-64 mb-3 rounded skeleton-magical" />
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded skeleton-magical" />
                    <div className="h-4 w-32 rounded skeleton-magical" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Action Buttons Skeleton */}
          <div className="flex gap-3">
            <div className="h-10 w-40 rounded skeleton-magical" />
            <div className="h-10 w-48 rounded skeleton-magical" />
          </div>
        </div>
      </div>
    )
  }
  
  if (availableChannels.length === 0) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Alert variant="destructive" className="magical-border" style={{ background: 'var(--card-bg)', borderColor: 'rgba(255, 0, 0, 0.3)' }}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle style={{ color: '#fcd34d' }}>No integrations connected</AlertTitle>
          <AlertDescription style={{ color: '#d4a574' }}>
            Please connect at least one integration (Mailchimp, Notion, or GitHub) in Settings before creating campaigns.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button 
            className="btn-magical"
            style={{ background: 'linear-gradient(135deg, var(--wizard-gold) 0%, var(--wizard-gold-dark) 100%)', border: 'none', color: 'var(--thunder-dark)' }}
            onClick={() => router.push('/settings')}
          >
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
          className="hover:bg-transparent hover:text-wizard-gold"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#fcd34d' }}>Create New Campaign</h1>
          <p style={{ color: '#fbbf24' }}>
            Distribute your design across multiple channels
          </p>
        </div>
      </div>
      
      <div className="grid gap-6">
        {selectedDesign && (
          <Card className="card-magical">
            <CardHeader>
              <CardTitle style={{ color: '#fcd34d' }}>Selected Design</CardTitle>
              <CardDescription style={{ color: '#d4a574' }}>You selected this design for your campaign</CardDescription>
            </CardHeader>
            <CardContent style={{ background: 'transparent' }}>
              <div className="flex gap-4 items-start">
                <img
                  src={selectedDesign.thumbnail?.url}
                  alt={selectedDesign.title}
                  className="w-32 h-32 object-cover rounded-lg magical-border"
                />
                <div>
                  <h3 className="font-medium" style={{ color: '#fcd34d' }}>{selectedDesign.title}</h3>
                  <p className="text-sm mt-1" style={{ color: '#d4a574' }}>
                    Design ID: {selectedDesign.id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card className="card-magical">
          <CardHeader>
            <CardTitle style={{ color: '#fcd34d' }}>Campaign Details</CardTitle>
            <CardDescription style={{ color: '#d4a574' }}>Configure your campaign settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6" style={{ background: 'transparent' }}>
            <div>
              <Label htmlFor="campaign-name" style={{ color: '#fcd34d' }}>Campaign Name</Label>
              <Input
                id="campaign-name"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Enter campaign name"
                className="mt-1 input-magical"
              />
            </div>
            
            <div className="space-y-3">
              <Label style={{ color: '#fcd34d' }}>Distribution Channels</Label>
              <p className="text-sm" style={{ color: '#d4a574' }}>
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
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-yellow-600 data-[state=checked]:to-yellow-500 data-[state=checked]:border-yellow-500 border-gray-600"
                    />
                    <label
                      htmlFor={channel.id}
                      className="flex items-center gap-2 cursor-pointer"
                      style={{ color: '#fbbf24' }}
                    >
                      <Icon className="h-4 w-4" />
                      {channel.name}
                    </label>
                  </div>
                )
              })}
            </div>
            
          </CardContent>
        </Card>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="magical-border hover:bg-transparent hover:border-wizard-gold hover:text-wizard-gold"
            style={{ color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.3)' }}
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
          <Button 
            className="btn-magical"
            style={{ background: 'linear-gradient(135deg, var(--wizard-gold) 0%, var(--wizard-gold-dark) 100%)', border: 'none'}}
            onClick={handleCustomizeCampaign} 
            disabled={!selectedDesign || !campaignName || selectedChannels.length === 0}
          >
            <Rocket className="w-4 h-4 mr-2 text-white" />
            <span className='text-white'>Customize Campaign</span>
          </Button>
        </div>
        
      </div>
    </div>
  )
}