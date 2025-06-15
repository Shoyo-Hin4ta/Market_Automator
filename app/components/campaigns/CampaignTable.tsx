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
import { Mail, BarChart3, Send } from 'lucide-react'
import { Campaign } from '@/app/types/campaign'
import { useState } from 'react'
import { useToast } from '@/app/hooks/use-toast'
import '../../styles/magical-theme.css'

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
  
  
  if (loading) {
    return (
      <div className="w-full">
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
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-4 w-32 skeleton-magical rounded" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 skeleton-magical rounded" />
                </TableCell>
                <TableCell>
                  <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <div className="h-5 w-12 bg-muted animate-pulse rounded" />
                    <div className="h-5 w-12 bg-muted animate-pulse rounded" />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <div className="h-8 w-20 skeleton-magical rounded" />
                    <div className="h-8 w-24 skeleton-magical rounded" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }
  
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No campaigns found</p>
        <p className="text-sm mt-2 text-muted-foreground/70">Create your first campaign from the dashboard</p>
      </div>
    )
  }
  
  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/50 hover:bg-muted/30">
            <TableHead className="text-foreground/70">Campaign Name</TableHead>
            <TableHead className="text-foreground/70">Created</TableHead>
            <TableHead className="text-foreground/70">Status</TableHead>
            <TableHead className="text-foreground/70">Channels</TableHead>
            <TableHead className="text-right text-foreground/70">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
              <TableCell className="font-medium text-foreground">{campaign.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(campaign.created_at))} ago
              </TableCell>
              <TableCell>
                <Badge 
                  className={
                    campaign.status === 'sent' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                    campaign.status === 'distributed' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                    'bg-gray-500/10 text-gray-600 border-gray-500/20'
                  }
                  variant="outline"
                >
                  {campaign.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {campaign.distributed_channels.map((channel) => (
                    <Badge 
                      key={channel} 
                      className="text-xs bg-primary/10 text-primary border-primary/20"
                      variant="outline"
                    >
                      {channel}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="hover:bg-primary/10 hover:text-primary transition-all"
                    onClick={() => window.location.href = `/campaigns/${campaign.id}`}
                  >
                    <BarChart3 className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  
                  {campaign.distributed_channels.includes('email') && 
                   campaign.status !== 'sent' && (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white border-0 shadow-sm hover:shadow-md transition-all"
                      onClick={() => handleSendEmail(campaign)}
                      disabled={sendingEmail === campaign.id}
                    >
                      <Send className="w-4 h-4 mr-1"/>
                      {sendingEmail === campaign.id ? 'Sending...' : 'Send Email'}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}