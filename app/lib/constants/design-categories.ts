import { CategoryFilter } from '@/app/types/canva'
import { 
  Instagram, 
  FileText, 
  Presentation, 
  Video, 
  Printer, 
  PenTool, 
  Globe,
  Image,
  LayoutGrid
} from 'lucide-react'

export const DESIGN_CATEGORIES: CategoryFilter[] = [
  {
    id: 'all',
    label: 'All',
    icon: 'LayoutGrid',
    keywords: []
  },
  {
    id: 'social-media',
    label: 'Social Media',
    icon: 'Instagram',
    keywords: ['instagram', 'facebook', 'twitter', 'social', 'post', 'story', 'reel', 'tiktok', 'linkedin', 'pinterest']
  },
  {
    id: 'presentation',
    label: 'Presentation',
    icon: 'Presentation',
    keywords: ['presentation', 'slides', 'powerpoint', 'keynote', 'pitch', 'deck']
  },
  {
    id: 'video',
    label: 'Video',
    icon: 'Video',
    keywords: ['video', 'animation', 'motion', 'reel', 'youtube', 'gif']
  },
  {
    id: 'print',
    label: 'Print',
    icon: 'Printer',
    keywords: ['print', 'flyer', 'poster', 'brochure', 'business card', 'card', 'invitation', 'menu', 'label']
  },
  {
    id: 'document',
    label: 'Document',
    icon: 'FileText',
    keywords: ['document', 'doc', 'report', 'letter', 'resume', 'cv', 'proposal', 'invoice', 'certificate']
  },
  {
    id: 'whiteboard',
    label: 'Whiteboard',
    icon: 'PenTool',
    keywords: ['whiteboard', 'diagram', 'flowchart', 'mindmap', 'brainstorm']
  },
  {
    id: 'website',
    label: 'Website',
    icon: 'Globe',
    keywords: ['website', 'web', 'landing', 'page', 'site', 'homepage', 'blog']
  },
  {
    id: 'photo',
    label: 'Photo',
    icon: 'Image',
    keywords: ['photo', 'image', 'picture', 'collage', 'edit', 'filter']
  }
]

export function getCategoryIcon(iconName: string) {
  const icons: Record<string, any> = {
    LayoutGrid,
    Instagram,
    Presentation,
    Video,
    Printer,
    FileText,
    PenTool,
    Globe,
    Image
  }
  return icons[iconName] || LayoutGrid
}

export function detectDesignCategory(title: string): DesignCategory {
  const lowerTitle = title.toLowerCase()
  
  // Skip 'all' category in detection
  for (const category of DESIGN_CATEGORIES.slice(1)) {
    for (const keyword of category.keywords) {
      if (lowerTitle.includes(keyword)) {
        return category.id
      }
    }
  }
  
  return 'all'
}