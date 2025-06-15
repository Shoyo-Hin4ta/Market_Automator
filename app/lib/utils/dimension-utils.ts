export type DimensionCategory = 
  | 'square'
  | 'landscape'
  | 'portrait'
  | 'story'
  | 'wide'
  | 'ultrawide'

export interface DimensionGroup {
  category: DimensionCategory
  label: string
  description: string
  aspectRatio: { min: number; max: number }
}

export const DIMENSION_GROUPS: DimensionGroup[] = [
  {
    category: 'square',
    label: 'Square (1:1)',
    description: 'Instagram posts, logos, profile pictures',
    aspectRatio: { min: 0.95, max: 1.05 }
  },
  {
    category: 'story',
    label: 'Story (9:16)',
    description: 'Instagram/TikTok stories, mobile designs',
    aspectRatio: { min: 0.5, max: 0.7 }
  },
  {
    category: 'portrait',
    label: 'Portrait',
    description: 'Documents, resumes, flyers',
    aspectRatio: { min: 0.7, max: 0.95 }
  },
  {
    category: 'landscape',
    label: 'Landscape (16:9)',
    description: 'Presentations, YouTube thumbnails, videos',
    aspectRatio: { min: 1.05, max: 2.0 }
  },
  {
    category: 'wide',
    label: 'Wide',
    description: 'Facebook covers, Twitter headers',
    aspectRatio: { min: 2.0, max: 3.5 }
  },
  {
    category: 'ultrawide',
    label: 'Ultra Wide',
    description: 'Banners, LinkedIn covers, email headers',
    aspectRatio: { min: 3.5, max: 10 }
  }
]

export function detectDimensionCategory(width?: number, height?: number): DimensionCategory | null {
  if (!width || !height || height === 0) return null
  
  const aspectRatio = width / height
  
  for (const group of DIMENSION_GROUPS) {
    if (aspectRatio >= group.aspectRatio.min && aspectRatio < group.aspectRatio.max) {
      return group.category
    }
  }
  
  // Default fallback based on aspect ratio
  if (aspectRatio > 1.05) return 'landscape'
  if (aspectRatio < 0.95) return 'portrait'
  return 'square'
}

export function getDimensionLabel(category: DimensionCategory): string {
  const group = DIMENSION_GROUPS.find(g => g.category === category)
  return group?.label || 'Other'
}

export function groupDesignsByDimension<T extends { thumbnail?: { width: number; height: number } }>(
  designs: T[]
): Map<DimensionCategory, T[]> {
  const grouped = new Map<DimensionCategory, T[]>()
  
  designs.forEach(design => {
    const category = detectDimensionCategory(
      design.thumbnail?.width,
      design.thumbnail?.height
    )
    
    if (category) {
      const existing = grouped.get(category) || []
      grouped.set(category, [...existing, design])
    }
  })
  
  return grouped
}