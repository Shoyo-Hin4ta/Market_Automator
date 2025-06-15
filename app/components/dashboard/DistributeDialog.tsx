import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CanvaDesign } from '@/app/types/canva'
import { useToast } from '@/app/hooks/use-toast'
import { useRouter } from 'next/navigation'
import '../../styles/magical-theme.css'

interface DistributeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  design: CanvaDesign
}

export function DistributeDialog({ open, onOpenChange, design }: DistributeDialogProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleDistribute = async () => {
    setIsLoading(true)
    try {
      // For now, store the selected design in sessionStorage and navigate to campaign creation
      sessionStorage.setItem('selectedDesign', JSON.stringify(design))
      
      // Navigate to campaign creation page (to be implemented in future features)
      router.push('/campaigns/new')
      
      toast({
        title: "Design selected",
        description: "Redirecting to campaign creation...",
      })
      
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to select design. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md modal-magical">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold" style={{ color: 'white' }}>Distribute Campaign</DialogTitle>
          <DialogDescription style={{ color: '#d4a574' }}>
              You're about to create a marketing campaign {design?.title ? `using “${design.title}”` : ''}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="rounded-lg overflow-hidden magical-border">
            <img
              src={design.thumbnail.url}
              alt={design.title}
              className="w-full h-48 object-cover"
            />
          </div>
          
          <p className="text-sm" style={{ color: '#d4a574' }}>
            This will open the campaign creation wizard where you can:
          </p>
          
          <ul className="text-sm space-y-2 list-disc list-inside" style={{ color: '#d4a574' }}>
            <li>Generate AI-powered content</li>
            <li>Select distribution channels (Email, Notion, GitHub)</li>
            <li>Configure campaign settings</li>
            <li>Schedule or send immediately</li>
          </ul>
          
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              className="magical-border hover:bg-transparent hover:border-wizard-gold hover:text-wizard-gold"
              style={{ color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.3)' }}
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              className="btn-magical"
              style={{ 
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', 
                border: 'none', 
                color: '#ffffff',
                fontWeight: '600',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              }}
              onClick={handleDistribute} 
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Continue to Campaign Setup"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}