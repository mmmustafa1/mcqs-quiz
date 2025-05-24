import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Edit2, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface EditDisplayNameProps {
  currentDisplayName?: string
  isGuest?: boolean
  trigger?: React.ReactNode
}

export function EditDisplayName({ currentDisplayName, isGuest = false, trigger }: EditDisplayNameProps) {
  const { updateDisplayName, updateGuestDisplayName } = useAuth()
  const [displayName, setDisplayName] = useState(currentDisplayName || '')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim()) return

    setIsLoading(true)

    try {
      if (isGuest) {
        updateGuestDisplayName(displayName.trim())
        setIsOpen(false)
      } else {
        const success = await updateDisplayName(displayName.trim())
        if (success) {
          setIsOpen(false)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <Edit2 className="h-4 w-4" />
      Edit Name
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit Display Name
          </DialogTitle>
          <DialogDescription>
            {isGuest 
              ? "Set your display name for this guest session. This will be stored locally in your browser."
              : "Choose how you'd like your name to appear throughout the app."
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                maxLength={50}
                required
              />
              <p className="text-sm text-muted-foreground">
                {displayName.length}/50 characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !displayName.trim()}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
