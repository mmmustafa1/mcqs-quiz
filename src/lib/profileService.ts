import { supabase, UserProfile } from '@/lib/supabase'

export class ProfileService {
  private profileCache: Map<string, UserProfile> = new Map()
  private readonly CACHE_KEY = 'user_profile_cache'
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

  // Load profile from localStorage
  private loadFromCache(userId: string): UserProfile | null {
    try {
      const cached = localStorage.getItem(`${this.CACHE_KEY}_${userId}`)
      if (!cached) return null

      const { profile, timestamp } = JSON.parse(cached)
      const isExpired = Date.now() - timestamp > this.CACHE_EXPIRY

      if (isExpired) {
        localStorage.removeItem(`${this.CACHE_KEY}_${userId}`)
        return null
      }

      return profile
    } catch {
      return null
    }
  }

  // Save profile to localStorage
  private saveToCache(userId: string, profile: UserProfile): void {
    try {
      const cacheData = {
        profile,
        timestamp: Date.now()
      }
      localStorage.setItem(`${this.CACHE_KEY}_${userId}`, JSON.stringify(cacheData))
      this.profileCache.set(userId, profile)
    } catch (error) {
      console.warn('Failed to cache profile:', error)
    }
  }

  // Clear cache for user
  private clearCache(userId: string): void {
    localStorage.removeItem(`${this.CACHE_KEY}_${userId}`)
    this.profileCache.delete(userId)
  }

  // Clear specific user's cache
  clearUserCache(userId: string): void {
    this.profileCache.delete(userId)
    try {
      localStorage.removeItem(`${this.CACHE_KEY}_${userId}`)
    } catch (error) {
      console.warn('Failed to clear user cache:', error)
    }
  }

  // Preload profile into cache (useful for immediate access)
  async preloadProfile(userId: string): Promise<void> {
    try {
      await this.getUserProfile(userId)
    } catch (error) {
      console.warn('Failed to preload profile:', error)
    }
  }

  // Force refresh profile from database
  async refreshProfile(userId: string): Promise<UserProfile | null> {
    this.clearCache(userId)
    return await this.getUserProfile(userId, true)
  }

  // Clear all cached profiles (useful for logout)
  clearAllCache(): void {
    try {
      // Clear localStorage profiles
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.CACHE_KEY)) {
          localStorage.removeItem(key)
        }
      })
      // Clear memory cache
      this.profileCache.clear()
    } catch (error) {
      console.warn('Failed to clear profile cache:', error)
    }
  }

  // Get user profile with caching
  async getUserProfile(userId: string, forceRefresh: boolean = false): Promise<UserProfile | null> {
    try {
      // Check memory cache first
      if (!forceRefresh && this.profileCache.has(userId)) {
        return this.profileCache.get(userId)!
      }

      // Check localStorage cache
      if (!forceRefresh) {
        const cached = this.loadFromCache(userId)
        if (cached) {
          this.profileCache.set(userId, cached)
          return cached
        }
      }

      console.log('Fetching profile from Supabase for user:', userId)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.log('Profile query error:', error)
        if (error.code === 'PGRST116') {
          // No profile found, create one
          console.log('No profile found, creating one...')
          const newProfile = await this.createUserProfile(userId)
          if (newProfile) {
            this.saveToCache(userId, newProfile)
          }
          return newProfile
        }
        console.warn('Error fetching profile:', error.message)
        return null
      }      console.log('Profile fetched successfully:', data)
      this.profileCache.set(userId, data)
      this.saveToCache(userId, data)
      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  // Create user profile
  async createUserProfile(userId: string, displayName?: string): Promise<UserProfile | null> {
    try {
      let finalDisplayName = displayName

      // If no display name provided, get user metadata or email
      if (!finalDisplayName) {
        const { data: user } = await supabase.auth.getUser()
        finalDisplayName = user.user?.user_metadata?.full_name || 
                          user.user?.email?.split('@')[0] || 
                          'User'
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          display_name: finalDisplayName
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating user profile:', error)
      return null
    }
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<Pick<UserProfile, 'display_name' | 'avatar_url'>>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating user profile:', error)
      return null
    }
  }
  // Update display name with cache update
  async updateDisplayName(userId: string, displayName: string): Promise<boolean> {
    try {
      console.log('Updating display name for user:', userId, 'to:', displayName)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ display_name: displayName })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Update display name error:', error)
        return false
      }
      
      console.log('Display name updated successfully:', data)
      
      // Update cache with new data immediately
      if (data) {
        this.profileCache.set(userId, data)
        this.saveToCache(userId, data)
      }
      
      return true
    } catch (error) {
      console.error('Error updating display name:', error)
      return false
    }
  }

  // Refresh display name from user metadata (useful for fixing existing profiles)
  async refreshDisplayNameFromMetadata(userId: string): Promise<boolean> {
    try {
      const { data: authUser } = await supabase.auth.getUser()
      
      if (!authUser.user || authUser.user.id !== userId) {
        return false
      }

      const metadataName = authUser.user.user_metadata?.full_name
      if (!metadataName) {
        return false // No metadata name to update to
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ display_name: metadataName })
        .eq('user_id', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error refreshing display name from metadata:', error)
      return false
    }
  }

  // Get display name for a user (fallback to email)
  async getDisplayName(userId: string): Promise<string> {
    try {
      const profile = await this.getUserProfile(userId)
      if (profile?.display_name) {
        return profile.display_name
      }

      // Fallback to email username
      const { data: user } = await supabase.auth.getUser()
      return user.user?.email?.split('@')[0] || 'User'
    } catch (error) {
      console.error('Error getting display name:', error)
      return 'User'
    }
  }

  // Change user password
  async changePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        console.error('Error changing password:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error changing password:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }
}

export const profileService = new ProfileService()
