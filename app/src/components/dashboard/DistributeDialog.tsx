import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CanvaDesign } from '@/types/canva'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Distribute Campaign</DialogTitle>
          <DialogDescription>
            You're about to create a marketing campaign using "{design.title}".
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="rounded-lg overflow-hidden border">
            <img
              src={design.thumbnail.url}
              alt={design.title}
              className="w-full h-48 object-cover"
            />
          </div>
          
          <p className="text-sm text-muted-foreground">
            This will open the campaign creation wizard where you can:
          </p>
          
          <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
            <li>Generate AI-powered content</li>
            <li>Select distribution channels (Email, Notion, GitHub)</li>
            <li>Configure campaign settings</li>
            <li>Schedule or send immediately</li>
          </ul>
          
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleDistribute} disabled={isLoading}>
              {isLoading ? "Loading..." : "Continue to Campaign Setup"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}