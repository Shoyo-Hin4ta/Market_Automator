import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface CampaignMetricsProps {
  analytics: {
    emails_sent: number
    emails_opened: number
    emails_clicked: number
    open_rate: number
    click_rate: number
    bounce_rate: number
    unsubscribes: number
    last_synced_at: string
  }
}

export function CampaignMetrics({ analytics }: CampaignMetricsProps) {
  return (
    <Card className="md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-lg">Email Campaign Analytics</CardTitle>
        <p className="text-sm text-muted-foreground">
          Last synced: {new Date(analytics.last_synced_at).toLocaleString()}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm font-medium">Emails Sent</p>
            <p className="text-2xl font-bold">{analytics.emails_sent}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium">Open Rate</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{analytics.open_rate.toFixed(1)}%</p>
              <Progress value={analytics.open_rate} className="flex-1" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.emails_opened} opened
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium">Click Rate</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{analytics.click_rate.toFixed(1)}%</p>
              <Progress value={analytics.click_rate} className="flex-1" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.emails_clicked} clicked
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium">Bounce Rate</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{analytics.bounce_rate.toFixed(1)}%</p>
              <Progress value={analytics.bounce_rate} className="flex-1" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.unsubscribes} unsubscribes
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}