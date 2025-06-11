import { DesignCard } from './DesignCard'
import { CanvaDesign } from '@/app/src/types/canva'
import { groupDesignsByDimension, getDimensionLabel, DIMENSION_GROUPS } from '@/app/src/lib/utils/dimension-utils'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface GroupedDesignGridProps {
  designs: CanvaDesign[]
  viewMode: 'grid' | 'list'
}

export function GroupedDesignGrid({ designs, viewMode }: GroupedDesignGridProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  
  if (designs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No designs found</p>
      </div>
    )
  }
  
  const groupedDesigns = groupDesignsByDimension(designs)
  
  // Sort dimension groups by order defined in DIMENSION_GROUPS
  const sortedGroups = Array.from(groupedDesigns.entries()).sort((a, b) => {
    const indexA = DIMENSION_GROUPS.findIndex(g => g.category === a[0])
    const indexB = DIMENSION_GROUPS.findIndex(g => g.category === b[0])
    return indexA - indexB
  })
  
  const toggleGroup = (category: string) => {
    const newCollapsed = new Set(collapsedGroups)
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category)
    } else {
      newCollapsed.add(category)
    }
    setCollapsedGroups(newCollapsed)
  }
  
  if (viewMode === 'list') {
    // For list view, we don't need grouping
    return (
      <div className="space-y-4">
        {designs.map((design) => (
          <DesignCard
            key={design.id}
            design={design}
            viewMode={viewMode}
          />
        ))}
      </div>
    )
  }
  
  return (
    <div className="space-y-8">
      {sortedGroups.map(([category, categoryDesigns]) => {
        const isCollapsed = collapsedGroups.has(category)
        const groupInfo = DIMENSION_GROUPS.find(g => g.category === category)
        
        return (
          <div key={category} className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleGroup(category)}
                  className="p-1"
                >
                  <ChevronRight 
                    className={cn(
                      "h-4 w-4 transition-transform",
                      !isCollapsed && "rotate-90"
                    )}
                  />
                </Button>
                <div>
                  <h3 className="text-lg font-semibold">
                    {getDimensionLabel(category)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {groupInfo?.description} • {categoryDesigns.length} design{categoryDesigns.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Designs Grid */}
            {!isCollapsed && (
              <div className={cn(
                "grid gap-6",
                // Different grid columns based on dimension type
                category === 'square' && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                category === 'portrait' && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                category === 'story' && "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
                category === 'landscape' && "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3",
                category === 'wide' && "grid-cols-1 md:grid-cols-1 lg:grid-cols-2",
                category === 'ultrawide' && "grid-cols-1"
              )}>
                {categoryDesigns.map((design) => (
                  <DesignCard
                    key={design.id}
                    design={design}
                    viewMode="grid"
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}