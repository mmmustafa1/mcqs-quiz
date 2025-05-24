import { supabase } from '@/lib/supabase'

export class SupabaseSecureStorage {
  // Store encrypted API key in Supabase
  async storeApiKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if Supabase is properly configured
      if (!supabase) {
        return { success: false, error: 'Supabase client not initialized' }
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Error getting user:', userError)
        return { success: false, error: `Authentication error: ${userError.message}` }
      }

      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      console.log('Storing API key for user:', user.id)

      // Use simple base64 encoding for now (in production, use proper encryption)
      const encodedApiKey = btoa(apiKey)

      const { data, error } = await supabase
        .from('secure_settings')
        .upsert({
          user_id: user.id,
          gemini_api_key: encodedApiKey,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('Error storing API key:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        
        // Provide more specific error messages
        if (error.code === '42P01') {
          return { success: false, error: 'Database table "secure_settings" does not exist. Please run the migration SQL.' }
        }
        if (error.code === '42501') {
          return { success: false, error: 'Permission denied. Please check Row Level Security policies.' }
        }
        
        return { success: false, error: `Database error: ${error.message}` }
      }

      console.log('API key stored successfully:', data)
      return { success: true }
    } catch (error) {
      console.error('Unexpected error storing API key:', error)
      return { success: false, error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` }
    }
  }

  // Retrieve and decrypt API key from Supabase
  async getApiKey(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return null
      }

      const { data, error } = await supabase
        .from('secure_settings')
        .select('gemini_api_key')
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        return null
      }

      // Decode the base64 encoded API key
      try {
        return atob(data.gemini_api_key)
      } catch {
        return null
      }
    } catch (error) {
      console.error('Error retrieving API key:', error)
      return null
    }
  }

  // Remove API key from Supabase
  async removeApiKey(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { error } = await supabase
        .from('secure_settings')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        console.error('Error removing API key:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error removing API key:', error)
      return { success: false, error: 'Failed to remove API key' }
    }
  }

  // Check if user has stored API key
  async hasApiKey(): Promise<boolean> {
    try {
      const apiKey = await this.getApiKey()
      return apiKey !== null && apiKey.length > 0
    } catch {
      return false
    }
  }
}

export const supabaseSecureStorage = new SupabaseSecureStorage()
