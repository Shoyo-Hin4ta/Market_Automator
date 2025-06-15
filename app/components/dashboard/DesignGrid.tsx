import { DesignCard } from './DesignCard'
import { CanvaDesign } from '@/app/types/canva'

interface DesignGridProps {
  designs: CanvaDesign[]
  viewMode: 'grid' | 'list'
}

export function DesignGrid({ designs, viewMode }: DesignGridProps) {
  if (designs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No designs found</p>
      </div>
    )
  }
  
  return (
    <div className={
      viewMode === 'grid'
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-min'
        : 'space-y-4'
    }>
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