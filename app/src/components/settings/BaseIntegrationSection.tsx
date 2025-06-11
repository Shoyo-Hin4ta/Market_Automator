import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
          {isConnected && <Badge variant="default" className="ml-auto bg-green-600">Connected</Badge>}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}