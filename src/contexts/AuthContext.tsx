import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isGuest: boolean
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  continueAsGuest: () => void
  exitGuestMode: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  const { toast } = useToast()
  useEffect(() => {
    // Check if user is in guest mode on initial load
    const guestMode = localStorage.getItem('guest_mode')
    if (guestMode === 'true') {
      setIsGuest(true)
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
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
      return { error: authError }    }
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
    loading,
    isGuest,
    signUp,
    signIn,
    signOut,
    resetPassword,
    continueAsGuest,
    exitGuestMode,
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
