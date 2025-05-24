import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { EditDisplayName } from '@/components/EditDisplayName'
import { ChangePassword } from '@/components/ChangePassword'
import { LogOut, User, Mail, Edit2, Lock } from 'lucide-react'

export function UserProfile() {
  const { user, profile, signOut, loading } = useAuth()
  const [open, setOpen] = useState(false)

  if (!user) return null
  // Don't show fallback email username while loading
  const displayName = loading 
    ? 'Loading...' 
    : profile?.display_name || user.email?.split('@')[0] || 'User'

  return (
    <Popover open={open} onOpenChange={setOpen}>      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{displayName}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card className="border-0 shadow-none">
          <CardContent className="space-y-4 p-4">
            <div className="space-y-3">
              <h4 className="font-medium leading-none">Profile</h4>
              
              {/* Display Name Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{displayName}</span>
                  </div>
                  <EditDisplayName 
                    currentDisplayName={displayName}
                    trigger={
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">Display name</p>
              </div>

              <Separator />
              
              {/* Password Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Password</span>
                  </div>
                  <ChangePassword 
                    trigger={
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">••••••••</p>
              </div>

              <Separator />
              
              {/* Email Section */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-muted text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="break-all">{user.email}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Member since: {new Date(user.created_at).toLocaleDateString()}
                </p>
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
