'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Mail, FileText, Github, AlertCircle } from 'lucide-react'
import { CampaignMetrics } from '@/app/src/components/campaigns/CampaignMetrics'
import { GitHubPagesInfo } from '@/app/src/components/campaigns/GitHubPagesInfo'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const [campaign, setCampaign] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchCampaignDetails()
  }, [params.id])
  
  const fetchCampaignDetails = async () => {
    try {
      const [campaignRes, analyticsRes] = await Promise.all([
        fetch(`/api/campaigns/${params.id}`),
        fetch(`/api/campaigns/${params.id}/analytics`)
      ])
      
      const campaignData = await campaignRes.json()
      const analyticsData = await analyticsRes.json()
      
      setCampaign(campaignData)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Failed to fetch campaign details:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) return <div className="container mx-auto py-8">Loading...</div>
  if (!campaign) return <div className="container mx-auto py-8">Campaign not found</div>
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{campaign.name}</h1>
        <p className="text-muted-foreground">
          Created {new Date(campaign.created_at).toLocaleDateString()}
        </p>
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
        
        {analytics && campaign.status === 'sent' && (
          <CampaignMetrics analytics={analytics} />
        )}
      </div>
    </div>
  )
}