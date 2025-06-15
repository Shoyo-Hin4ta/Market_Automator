export interface CanvaDesign {
  id: string
  title: string
  thumbnail?: {
    url: string
    width: number
    height: number
  }
  updated_at: number
  urls?: {
    view_url: string
    edit_url: string
  }
  owner?: {
    user_id: string
    display_name: string
  }
  page_count?: number
}

export type DesignCategory = 
  | 'all'
  | 'social-media'
  | 'presentation' 
  | 'video'
  | 'print'
  | 'document'
  | 'whiteboard'
  | 'website'
  | 'photo'

export interface CategoryFilter {
  id: DesignCategory
  label: string
  icon: string
  keywords: string[]
}