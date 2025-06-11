'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NotionSection } from '../src/components/settings/NotionSection'
import { GitHubSection } from '../src/components/settings/GitHubSection'
import { MailchimpSection } from '../src/components/settings/MailchimpSection'
import { OpenAISection } from '../src/components/settings/OpenAISection'
import { CanvaSection } from '../src/components/settings/CanvaSection'
import { ProgressIndicator } from '../src/components/settings/ProgressIndicator'
import { useIntegrations } from '../src/hooks/useIntegrations'
import { useToast } from '../src/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

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
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ProgressIndicator integrations={integrations} />
      
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="notion">Notion</TabsTrigger>
          <TabsTrigger value="github">GitHub</TabsTrigger>
          <TabsTrigger value="mailchimp">Mailchimp</TabsTrigger>
          <TabsTrigger value="openai">OpenAI</TabsTrigger>
          <TabsTrigger value="canva">Canva</TabsTrigger>
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