'use client'

import { useEffect, useState, use } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Mail, FileText, Github, AlertCircle, RefreshCw, Users, Clock } from 'lucide-react'
import { CampaignMetrics } from '@/app/src/components/campaigns/CampaignMetrics'
import { EnhancedCampaignMetrics } from '@/app/src/components/campaigns/EnhancedCampaignMetrics'
import { GitHubPagesInfo } from '@/app/src/components/campaigns/GitHubPagesInfo'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/app/src/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [campaign, setCampaign] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [mailchimpDetails, setMailchimpDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const { toast } = useToast()
  
  useEffect(() => {
    fetchCampaignDetails()
  }, [id])
  
  const fetchCampaignDetails = async () => {
    try {
      const [campaignRes, analyticsRes] = await Promise.all([
        fetch(`/api/campaigns/${id}`),
        fetch(`/api/campaigns/${id}/analytics`)
      ])
      
      const campaignData = await campaignRes.json()
      const analyticsData = await analyticsRes.json()
      
      console.log('Campaign Data:', campaignData)
      console.log('Analytics Data from DB:', analyticsData)
      
      setCampaign(campaignData)
      setAnalytics(analyticsData)
      
      // Fetch Mailchimp details if email campaign exists
      if (campaignData.mailchimp_campaign_id && campaignData.status === 'sent') {
        try {
          const mailchimpRes = await fetch(`/api/campaigns/${id}/mailchimp-details`)
          if (mailchimpRes.ok) {
            const mailchimpData = await mailchimpRes.json()
            console.log('Mailchimp Details:', mailchimpData)
            setMailchimpDetails(mailchimpData)
          }
        } catch (error) {
          console.error('Failed to fetch Mailchimp details:', error)
        }
      }
    } catch (error) {
      console.error('Failed to fetch campaign details:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSyncAnalytics = async () => {
    setSyncing(true)
    try {
      const response = await fetch(`/api/campaigns/${id}/sync-analytics`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }
      
      const data = await response.json()
      console.log('Sync Response:', data)
      
      toast({
        title: 'Analytics synced',
        description: 'Latest analytics data has been fetched from Mailchimp'
      })
      
      // Refresh data
      await fetchCampaignDetails()
    } catch (error) {
      console.error('Sync error:', error)
      toast({
        title: 'Sync failed',
        description: error instanceof Error ? error.message : 'Failed to sync analytics',
        variant: 'destructive'
      })
    } finally {
      setSyncing(false)
    }
  }
  
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        {/* Header skeleton */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Campaign Design skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-full h-48 rounded-lg mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          
          {/* Distribution Channels skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-6" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
          
          {/* Email details skeleton */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <Skeleton className="h-5 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-5 w-48" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-5 w-40" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-5 w-36" />
                </div>
                <div>
                  <Skeleton className="h-4 w-12 mb-1" />
                  <Skeleton className="h-5 w-56" />
                </div>
              </div>
              <div className="mt-4">
                <Skeleton className="h-8 w-36" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  if (!campaign) return <div className="container mx-auto py-8">Campaign not found</div>
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
            <p className="text-muted-foreground">
              Created {new Date(campaign.created_at).toLocaleDateString()}
            </p>
          </div>
          {campaign.status === 'sent' && (
            <Button
              variant="outline"
              onClick={handleSyncAnalytics}
              disabled={syncing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Analytics'}
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Campaign Design</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={campaign.canva_thumbnail_url}
              alt={campaign.name}
              className="w-full rounded-lg mb-4"
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(campaign.canva_design_url, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View in Canva
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribution Channels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {campaign.distributed_channels.includes('email') && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Email Campaign</span>
                </div>
                <Badge>{campaign.status === 'sent' ? 'Sent' : 'Ready'}</Badge>
              </div>
            )}
            
            {campaign.notion_page_id && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Notion Database</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    try {
                      // Fetch the user's Notion database info
                      const response = await fetch('/api/integrations/notion')
                      if (response.ok) {
                        const data = await response.json()
                        if (data.database?.url) {
                          // The URL is already formatted correctly
                          window.open(data.database.url, '_blank')
                        } else if (data.database?.id) {
                          // Fallback to constructing the URL
                          const dbId = data.database.id.replace(/-/g, '')
                          window.open(`https://www.notion.so/${dbId}`, '_blank')
                        }
                      }
                    } catch (error) {
                      console.error('Failed to open Notion database:', error)
                    }
                  }}
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            )}
            
            {campaign.github_page_url && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    <span>Landing Page</span>
                  </div>
                </div>
                
                <GitHubPagesInfo 
                  githubUrl={campaign.github_page_url}
                  createdAt={campaign.created_at}
                />
              </div>
            )}
          </CardContent>
        </Card>
        
        {campaign.status === 'sent' && (
          <>
            {/* Email Campaign Info Card */}
            {mailchimpDetails && (
              <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle className="text-lg">Email Campaign Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Subject</p>
                      <p className="font-medium">{mailchimpDetails.settings?.subject_line || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Audience</p>
                      <p className="font-medium flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {mailchimpDetails.recipients?.list_name || 'N/A'}
                        {mailchimpDetails.recipients?.recipient_count && (
                          <span className="text-sm text-muted-foreground">
                            ({mailchimpDetails.recipients.recipient_count} recipients)
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Sent Time</p>
                      <p className="font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {mailchimpDetails.send_time ? 
                          new Date(mailchimpDetails.send_time).toLocaleString() : 
                          'Sending...'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">From</p>
                      <p className="font-medium">
                        {mailchimpDetails.settings?.from_name} ({mailchimpDetails.settings?.reply_to})
                      </p>
                    </div>
                  </div>
                  {mailchimpDetails.archive_url && (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(mailchimpDetails.archive_url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Email Archive
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Analytics Metrics */}
            {analytics ? (
              <EnhancedCampaignMetrics 
                analytics={analytics} 
                className="md:col-span-2 lg:col-span-3" 
              />
            ) : (
              <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle className="text-lg">Email Campaign Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Analytics data is not available yet. Email campaigns typically need a few minutes after sending before analytics become available. Click "Sync Analytics" to check for updates.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}