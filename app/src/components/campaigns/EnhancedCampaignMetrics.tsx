import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { 
  Mail, 
  MousePointer, 
  Eye, 
  AlertTriangle, 
  Users, 
  Forward, 
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react'

interface EnhancedCampaignMetricsProps {
  analytics: {
    emails_sent: number
    emails_opened: number
    emails_clicked: number
    open_rate: number
    click_rate: number
    bounce_rate: number
    unsubscribes: number
    last_synced_at: string
    // Additional metrics
    total_opens?: number
    total_clicks?: number
    deliveries?: number
    forwards_count?: number
    abuse_reports?: number
    last_open?: string
    last_click?: string
  }
  className?: string
}

export function EnhancedCampaignMetrics({ analytics, className }: EnhancedCampaignMetricsProps) {
  const deliveryRate = analytics.deliveries 
    ? ((analytics.deliveries / analytics.emails_sent) * 100).toFixed(1) 
    : '100.0'

  const clicksPerUniqueOpens = analytics.emails_opened > 0 
    ? ((analytics.emails_clicked / analytics.emails_opened) * 100).toFixed(1)
    : '0.0'

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Email Performance</CardTitle>
          <p className="text-sm text-muted-foreground">
            Last synced: {new Date(analytics.last_synced_at).toLocaleString()}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Deliveries */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <p className="text-sm font-medium">Deliveries</p>
              </div>
              <p className="text-2xl font-bold">
                {analytics.deliveries || analytics.emails_sent} ({deliveryRate}%)
              </p>
              <p className="text-xs text-muted-foreground">
                {analytics.emails_sent} sent
              </p>
            </div>
            
            {/* Open Rate */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-medium">Open Rate</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{analytics.open_rate.toFixed(1)}%</p>
                <Progress value={analytics.open_rate} className="flex-1 h-2" />
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.emails_opened} unique opens
                {analytics.total_opens && analytics.total_opens > analytics.emails_opened && (
                  <span> ({analytics.total_opens} total)</span>
                )}
              </p>
            </div>
            
            {/* Click Rate */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-purple-600" />
                <p className="text-sm font-medium">Click Rate</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{analytics.click_rate.toFixed(1)}%</p>
                <Progress value={analytics.click_rate} className="flex-1 h-2" />
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.emails_clicked} unique clicks
                {analytics.total_clicks && analytics.total_clicks > analytics.emails_clicked && (
                  <span> ({analytics.total_clicks} total)</span>
                )}
              </p>
            </div>
            
            {/* Bounce Rate */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm font-medium">Bounce Rate</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{analytics.bounce_rate.toFixed(1)}%</p>
                <Progress 
                  value={analytics.bounce_rate} 
                  className="flex-1 h-2"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Lower is better
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Email Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Email Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Clicks per unique opens */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Clicks per unique opens</p>
              <p className="text-lg font-semibold">{clicksPerUniqueOpens}%</p>
            </div>
            
            {/* Total Opens */}
            {analytics.total_opens !== undefined && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total opens</p>
                <p className="text-lg font-semibold">{analytics.total_opens}</p>
              </div>
            )}
            
            {/* Total Clicks */}
            {analytics.total_clicks !== undefined && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total clicks</p>
                <p className="text-lg font-semibold">{analytics.total_clicks}</p>
              </div>
            )}
            
            {/* Last Opened */}
            {analytics.last_open && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last opened</p>
                <p className="text-lg font-semibold">
                  {new Date(analytics.last_open).toLocaleString()}
                </p>
              </div>
            )}
            
            {/* Last Clicked */}
            {analytics.last_click && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last clicked</p>
                <p className="text-lg font-semibold">
                  {new Date(analytics.last_click).toLocaleString()}
                </p>
              </div>
            )}
            
            {/* Forwards */}
            {analytics.forwards_count !== undefined && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Forwarded</p>
                <p className="text-lg font-semibold">{analytics.forwards_count}</p>
              </div>
            )}
            
            {/* Unsubscribes */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Unsubscribes</p>
              <p className="text-lg font-semibold">{analytics.unsubscribes}</p>
            </div>
            
            {/* Abuse Reports */}
            {analytics.abuse_reports !== undefined && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Abuse reports</p>
                <p className="text-lg font-semibold">{analytics.abuse_reports}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}