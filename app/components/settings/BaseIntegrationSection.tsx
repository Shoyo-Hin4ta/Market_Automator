import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import '../../styles/magical-theme.css'
import '@/app/styles/settings-overrides.css'

interface BaseIntegrationProps {
  title: string
  description: string
  icon: React.ReactNode
  children: React.ReactNode
  isConnected: boolean
}

export function BaseIntegrationSection({
  title,
  description,
  icon,
  children,
  isConnected
}: BaseIntegrationProps) {
  return (
    <Card className="card-magical">
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: 'var(--wizard-gold)' }}>
          <span style={{ color: 'var(--wizard-gold-light)' }}>{icon}</span>
          <span className="text-magical-heading">{title}</span>
          {isConnected && (
            <Badge 
              variant="default" 
              className="ml-auto badge-magical" 
              style={{ background: 'linear-gradient(135deg, var(--wizard-gold) 0%, var(--wizard-gold-dark) 100%)', border: 'none', color: 'var(--thunder-dark)' }}
            >
              Connected
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-magical-secondary">{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}