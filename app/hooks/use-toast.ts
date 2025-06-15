import { toast } from 'sonner'

interface ToastProps {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  return {
    toast: ({ title, description, variant }: ToastProps) => {
      if (variant === 'destructive') {
        toast.error(title, {
          description
        })
      } else {
        toast.success(title, {
          description
        })
      }
    }
  }
}