import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, User, Mail } from 'lucide-react'

export function UserProfile() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  if (!user) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Profile</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card className="border-0 shadow-none">
          <CardContent className="space-y-4 p-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Profile</h4>
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-muted text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="break-all">{user.email}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Member since: {new Date(user.created_at).toLocaleDateString()}
              </div>
            </div>
            
            <Button 
              onClick={() => {
                signOut()
                setOpen(false)
              }} 
              variant="outline" 
              className="w-full"
              size="sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
