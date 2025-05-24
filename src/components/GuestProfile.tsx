import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogIn, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function GuestProfile() {
  const { exitGuestMode } = useAuth()

  const handleSignUp = () => {
    exitGuestMode()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <User className="h-4 w-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Guest User</p>
            <p className="text-xs leading-none text-muted-foreground">
              Local storage mode
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={handleSignUp}>
          <LogIn className="mr-2 h-4 w-4" />
          <span>Sign Up / Sign In</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <Badge variant="outline" className="text-xs">
            <Shield className="mr-1 h-3 w-3" />
            Guest Mode
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">
            Data stored locally in browser only
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
