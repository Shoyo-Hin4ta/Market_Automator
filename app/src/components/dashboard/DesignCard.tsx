import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DistributeDialog } from './DistributeDialog'
import { formatDistanceToNow } from 'date-fns'
import { MoreVertical, Send, Eye } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CanvaDesign } from '@/types/canva'

interface DesignCardProps {
  design: CanvaDesign
  viewMode: 'grid' | 'list'
}

export function DesignCard({ design, viewMode }: DesignCardProps) {
  const [showDistribute, setShowDistribute] = useState(false)
  
  if (viewMode === 'list') {
    return (
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <img
              src={design.thumbnail.url}
              alt={design.title}
              className="w-16 h-16 object-cover rounded"
            />
            <div>
              <h3 className="font-medium">{design.title}</h3>
              <p className="text-sm text-muted-foreground">
                Updated {formatDistanceToNow(new Date(design.updated_at * 1000))} ago
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowDistribute(true)}
            >
              <Send className="w-4 h-4 mr-2" />
              Distribute
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => window.open(design.urls.view_url, '_blank')}>
                  <Eye className="w-4 h-4 mr-2" />
                  View in Canva
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-square relative group">
          <img
            src={design.thumbnail.url}
            alt={design.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              variant="secondary"
              onClick={() => setShowDistribute(true)}
            >
              <Send className="w-4 h-4 mr-2" />
              Distribute Campaign
            </Button>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium truncate">{design.title}</h3>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(design.updated_at * 1000))} ago
          </p>
        </CardContent>
      </Card>
      
      <DistributeDialog
        open={showDistribute}
        onOpenChange={setShowDistribute}
        design={design}
      />
    </>
  )
}