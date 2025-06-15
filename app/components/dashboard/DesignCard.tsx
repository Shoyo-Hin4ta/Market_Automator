import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DistributeDialog } from './DistributeDialog'
import { formatDistanceToNow } from 'date-fns'
import { MoreVertical, Send, Eye } from 'lucide-react'
import { CustomContextMenu, CustomContextMenuItem } from '@/app/components/ui/CustomContextMenu'
import { CanvaDesign } from '@/app/types/canva'
import '../../styles/magical-theme.css'

interface DesignCardProps {
  design: CanvaDesign
  viewMode: 'grid' | 'list'
}

export function DesignCard({ design, viewMode }: DesignCardProps) {
  const [showDistribute, setShowDistribute] = useState(false)
  
  // Debug logging
  console.log('DesignCard rendered for:', design.title, 'showDistribute:', showDistribute)
  
  // Safety check for missing data
  if (!design || !design.thumbnail?.url) {
    return null
  }
  
  if (viewMode === 'list') {
    return (
      <>
        <Card className="card-magical">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <img
                src={design.thumbnail.url}
                alt={design.title || 'Untitled'}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <h3 className="font-medium text-yellow-300">{design.title || 'Untitled'}</h3>
                <p className="text-sm text-amber-300">
                  Updated {formatDistanceToNow(new Date(design.updated_at * 1000))} ago
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="distribute-btn-magical px-3 py-1.5 rounded-md text-sm font-bold text-white transition-all duration-300 flex items-center relative overflow-hidden"
                style={{
                  backgroundColor: '#fcd34d',
                  backgroundImage: 'linear-gradient(to right, #ca8a04, #eab308)',
                  border: 'none'
                }}
                onClick={() => {
                  console.log('List distribute clicked!', design.title)
                  setShowDistribute(true)
                }}
              >
                <Send className="w-4 h-4 mr-2" />
                Distribute
              </button>
              <CustomContextMenu
                trigger={
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover:bg-transparent hover:text-wizard-gold"
                    style={{ position: 'relative', zIndex: 10 }}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                }
              >
                <CustomContextMenuItem
                  onClick={() => design.urls?.view_url && window.open(design.urls.view_url, '_blank')}
                  disabled={!design.urls?.view_url}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View in Canva
                </CustomContextMenuItem>
              </CustomContextMenu>
            </div>
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
  
  // Calculate aspect ratio style
  const aspectRatio = design.thumbnail?.width && design.thumbnail?.height
    ? design.thumbnail.width / design.thumbnail.height
    : 1

  return (
    <>
      <Card className="card-magical overflow-hidden group">


        <div className="relative" style={{ aspectRatio }}>
          <img
            src={design.thumbnail.url}
            alt={design.title || 'Untitled'}
            className="w-full h-full object-contain"
          />
          
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Button container - NO opacity here */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
            <button
              className="distribute-btn-magical px-4 py-2 rounded-md font-bold text-white opacity-0 group-hover:opacity-100 transition-all duration-300 relative z-20 flex items-center overflow-hidden"
              style={{
                backgroundColor: '#fcd34d',
                backgroundImage: 'linear-gradient(to right, #ca8a04, #eab308)',
                border: 'none'
              }}
              onClick={() => {
                console.log('Distribute clicked!', design.title)
                setShowDistribute(true)
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Send className="w-4 h-4 mr-2" />
              Distribute Campaign
            </button>
          </div>
        </div>
        
        <CardContent className="p-4" style={{ background: 'transparent' }}>
          <h3 className="font-medium truncate text-yellow-300">{design.title || 'Untitled'}</h3>
          <p className="text-sm text-gray-400">
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