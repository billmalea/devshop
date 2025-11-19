"use client"

import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from "sonner"

export function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      toast.error("Error signing out")
    } else {
      toast.success("Signed out successfully")
      router.push("/auth/login")
      router.refresh()
    }
  }

  return (
    <Button 
      variant="outline" 
      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
      onClick={handleSignOut}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  )
}
