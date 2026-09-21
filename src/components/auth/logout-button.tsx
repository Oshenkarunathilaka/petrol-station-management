'use client'

import { useTransition } from 'react'
import { LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/login/actions'

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      await logout()
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
      aria-label="Sign out"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      <span className="hidden sm:inline-block">Sign Out</span>
    </Button>
  )
}
