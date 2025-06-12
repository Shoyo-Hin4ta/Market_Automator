'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { Mail, BarChart3, Send, RefreshCw } from 'lucide-react'
import { Campaign } from '@/app/src/types/campaign'
import { useState } from 'react'
import { useToast } from '@/app/src//hooks/use-toast'

interface CampaignTableProps {
  campaigns: Campaign[]
  loading: boolean
}

export function CampaignTable({ campaigns, loading }: CampaignTableProps) {
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)
  const { toast } = useToast()
  
  const handleSendEmail = async (campaign: Campaign) => {
    if (!campaign.mailchimp_campaign_id) {
      toast({
        title: 'Email not configured',
        description: 'This campaign was not distributed via email',
        variant: 'destructive'
      })
      return
    }
    
    setSendingEmail(campaign.id)
    
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}/send-email`, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Failed to send email')
      
      toast({
        title: 'Email sent!',
        description: 'Your campaign has been sent to the mailing list'
      })
      
      // Refresh campaign data
      window.location.reload()
    } catch (error) {
      toast({
        title: 'Failed to send',
        description: error instanceof Error ? error.message : 'Failed to send email',
        variant: 'destructive'
      })
    } finally {
      setSendingEmail(null)
    }
  }
  
  const handleSyncAnalytics = async (campaign: Campaign) => {
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}/sync-analytics`, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Failed to sync analytics')
      
      toast({
        title: 'Analytics synced',
        description: 'Latest analytics data has been fetched'
      })
      
      window.location.reload()
    } catch (error) {
      toast({
        title: 'Sync failed',
        description: error instanceof Error ? error.message : 'Failed to sync analytics',
        variant: 'destructive'
      })
    }
  }
  
  if (loading) {
    return <div className="text-center py-8">Loading campaigns...</div>
  }
  
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No campaigns found</p>
        <p className="text-sm text-muted-foreground mt-2">Create your first campaign from the dashboard</p>
      </div>
    )
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Campaign Name</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Channels</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns.map((campaign) => (
          <TableRow key={campaign.id}>
            <TableCell className="font-medium">{campaign.name}</TableCell>
            <TableCell>
              {formatDistanceToNow(new Date(campaign.created_at))} ago
            </TableCell>
            <TableCell>
              <Badge variant={
                campaign.status === 'sent' ? 'default' :
                campaign.status === 'distributed' ? 'secondary' :
                'outline'
              }>
                {campaign.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                {campaign.distributed_channels.map((channel) => (
                  <Badge key={channel} variant="outline" className="text-xs">
                    {channel}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.href = `/campaigns/${campaign.id}`}
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  View
                </Button>
                
                {campaign.distributed_channels.includes('email') && 
                 campaign.status !== 'sent' && (
                  <Button
                    size="sm"
                    onClick={() => handleSendEmail(campaign)}
                    disabled={sendingEmail === campaign.id}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    {sendingEmail === campaign.id ? 'Sending...' : 'Send Email'}
                  </Button>
                )}
                
                {campaign.status === 'sent' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSyncAnalytics(campaign)}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}