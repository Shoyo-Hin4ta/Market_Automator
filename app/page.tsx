import { createClient } from '@/app/lib/supabase/server'
import LandingPageContent from '@/app/components/LandingPageContent'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  return <LandingPageContent isAuthenticated={!!user} />
}