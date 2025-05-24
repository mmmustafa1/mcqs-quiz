import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, UserProfile } from '@/lib/supabase'
import { profileService } from '@/lib/profileService'
import { useToast } from '@/components/ui/use-toast'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  isGuest: boolean
  guestDisplayName: string
  signUp: (email: string, password: string, name?: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updateDisplayName: (displayName: string) => Promise<boolean>
  updateGuestDisplayName: (displayName: string) => void
  continueAsGuest: () => void
  exitGuestMode: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  const [guestDisplayName, setGuestDisplayName] = useState(() => {
    return localStorage.getItem('guest_display_name') || 'Guest User'
  })
  
  const { toast } = useToast()  // Load user profile with caching
  const loadUserProfile = useCallback(async (userId: string, forceRefresh: boolean = false) => {
    try {
      const userProfile = await profileService.getUserProfile(userId, forceRefresh)
      setProfile(userProfile)
    } catch (error) {
      console.error('Error loading user profile:', error)
      setProfile(null)
    }
  }, [])

  const refreshProfile = async () => {
    if (user?.id) {
      await loadUserProfile(user.id)
    }
  }
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Initializing auth...')
      
      // Check if user is in guest mode on initial load
      const guestMode = localStorage.getItem('guest_mode')
      if (guestMode === 'true') {
        console.log('User in guest mode')
        setIsGuest(true)
        setLoading(false)
        return
      }

      try {
        // Get initial session
        console.log('Getting initial session...')
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Session:', session ? 'Found' : 'Not found')
        
        setSession(session)
        setUser(session?.user ?? null)
          // Load user profile if user exists (non-blocking, but aggressive caching)
        if (session?.user?.id) {
          console.log('Loading user profile...')
          // Preload profile into cache immediately for fast access
          profileService.preloadProfile(session.user.id).then(() => {
            loadUserProfile(session.user.id).catch(console.error)
          }).catch(console.error)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        console.log('Auth initialization complete')
        setLoading(false)
      }
    }

    initializeAuth()

    // Set a safety timeout to ensure loading never gets stuck
    const safetyTimeout = setTimeout(() => {
      console.warn('Auth initialization taking too long, forcing loading to false')
      setLoading(false)
    }, 15000) // 15 second timeout

    // Listen for auth changes
    const {
      data: { subscription },    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
        // Load user profile if user exists (non-blocking, with aggressive caching)
      if (session?.user?.id) {
        // If this is a new sign up confirmation, create profile with metadata
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session.user.user_metadata?.full_name) {
          const existingProfile = await profileService.getUserProfile(session.user.id)
          if (!existingProfile) {
            await profileService.createUserProfile(session.user.id, session.user.user_metadata.full_name)
          }
        }
        // Preload profile for immediate access, then update state
        profileService.preloadProfile(session.user.id).then(() => {
          loadUserProfile(session.user.id).catch(console.error)
        }).catch(console.error)
      } else {
        setProfile(null)
      }setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(safetyTimeout)
    }
  }, [loadUserProfile])
  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const signUpOptions = {
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          ...(name && name.trim() ? { data: { full_name: name.trim() } } : {})
        }
      }

      const { data, error } = await supabase.auth.signUp(signUpOptions)
      
      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your registration."
        })
      }
      
      return { error }
    } catch (error) {
      const authError = error as AuthError
      toast({
        title: "Sign up failed",
        description: authError.message,
        variant: "destructive"
      })
      return { error: authError }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in."
        })
      }
      
      return { error }
    } catch (error) {
      const authError = error as AuthError
      toast({
        title: "Sign in failed",
        description: authError.message,
        variant: "destructive"
      })
      return { error: authError }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Signed out",
          description: "You have been successfully signed out."
        })
      }
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      
      if (error) {
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Check your email",
          description: "We've sent you a password reset link."
        })
      }
        return { error }
    } catch (error) {
      const authError = error as AuthError
      toast({
        title: "Password reset failed",
        description: authError.message,
        variant: "destructive"
      })
      return { error: authError }
    }
  }
  const updateDisplayName = async (displayName: string): Promise<boolean> => {
    if (!user?.id) return false
    
    try {
      const success = await profileService.updateDisplayName(user.id, displayName)
      if (success) {
        // Update local profile state immediately
        setProfile(prev => prev ? { ...prev, display_name: displayName } : null)
        toast({
          title: "Display name updated",
          description: "Your display name has been successfully updated."
        })
        return true
      }
      return false
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update display name. Please try again.",
        variant: "destructive"
      })
      return false
    }
  }

  const updateGuestDisplayName = (displayName: string) => {
    setGuestDisplayName(displayName)
    localStorage.setItem('guest_display_name', displayName)
    toast({
      title: "Display name updated",
      description: "Your guest display name has been updated."
    })
  }

  const continueAsGuest = () => {
    localStorage.setItem('guest_mode', 'true')
    setIsGuest(true)
    setLoading(false)
    toast({
      title: "Guest Mode",
      description: "You're now using the app as a guest. Your data will be stored locally in your browser.",
    })
  }

  const exitGuestMode = () => {
    localStorage.removeItem('guest_mode')
    setIsGuest(false)
  }
  const value = {
    user,
    session,
    profile,
    loading,
    isGuest,
    guestDisplayName,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateDisplayName,
    updateGuestDisplayName,
    continueAsGuest,
    exitGuestMode,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
