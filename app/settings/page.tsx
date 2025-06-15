'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NotionSection } from '@/app/components/settings/NotionSection'
import { GitHubSection } from '@/app/components/settings/GitHubSection'
import { MailchimpSection } from '@/app/components/settings/MailchimpSection'
import { OpenAISection } from '@/app/components/settings/OpenAISection'
import { CanvaSection } from '@/app/components/settings/CanvaSection'
import { ProgressIndicator } from '@/app/components/settings/ProgressIndicator'
import { useIntegrations } from '../hooks/useIntegrations'
import { useToast } from '../hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import '@/app/styles/magical-theme.css'
import '@/app/styles/settings-overrides.css'

export default function SettingsPage() {
  const { integrations, loading } = useIntegrations()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const defaultTab = searchParams.get('tab') || 'notion'
  
  useEffect(() => {
    // Handle OAuth callback messages
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    
    if (success === 'true') {
      toast({
        title: 'Connected!',
        description: 'Your account has been successfully connected.',
      })
    } else if (error) {
      let errorMessage = 'Failed to connect your account.'
      switch (error) {
        case 'oauth_denied':
          errorMessage = 'You denied the authorization request.'
          break
        case 'missing_params':
          errorMessage = 'Missing required parameters. Please try again.'
          break
        case 'invalid_state':
          errorMessage = 'Invalid state parameter. Please try again.'
          break
        case 'callback_failed':
          errorMessage = 'Failed to complete the connection. Please try again.'
          break
      }
      toast({
        title: 'Connection Failed',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }, [searchParams, toast])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full skeleton-magical" />
        <Skeleton className="h-64 w-full skeleton-magical" />
      </div>
    )
  }

  return (
    <div className="space-y-6 settings-page">
      <ProgressIndicator integrations={integrations} />
      
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 magical-border" style={{ background: 'var(--card-bg)' }}>
          <TabsTrigger value="notion" className="tab-magical">Notion</TabsTrigger>
          <TabsTrigger value="github" className="tab-magical">GitHub</TabsTrigger>
          <TabsTrigger value="mailchimp" className="tab-magical">Mailchimp</TabsTrigger>
          <TabsTrigger value="openai" className="tab-magical">OpenAI</TabsTrigger>
          <TabsTrigger value="canva" className="tab-magical">Canva</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notion">
          <NotionSection isConnected={integrations.notion} />
        </TabsContent>
        
        <TabsContent value="github">
          <GitHubSection isConnected={integrations.github} />
        </TabsContent>
        
        <TabsContent value="mailchimp">
          <MailchimpSection isConnected={integrations.mailchimp} />
        </TabsContent>
        
        <TabsContent value="openai">
          <OpenAISection isConnected={integrations.openai} />
        </TabsContent>
        
        <TabsContent value="canva">
          <CanvaSection isConnected={integrations.canva} />
        </TabsContent>
      </Tabs>
    </div>
  )
}