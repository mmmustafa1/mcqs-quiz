import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseSecureStorage } from '@/lib/supabaseSecureStorage';

export const useGeminiAPI = () => {
  const { user, isGuest } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [isLoadingApiKey, setIsLoadingApiKey] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);  // Load saved API key on component mount and when user changes
  useEffect(() => {
    const loadApiKey = async () => {
      if (!user && !isGuest) {
        setApiKey('');
        setApiKeySaved(false);
        setIsInitialLoading(false);
        return;
      }

      // Only set loading state to true when explicitly saving, not during initial load
      try {
        let savedApiKey;
        if (isGuest) {
          // For guest mode, use localStorage
          savedApiKey = localStorage.getItem('gemini_api_key');
        } else {
          // For authenticated users, use Supabase
          savedApiKey = await supabaseSecureStorage.getApiKey();
        }
        
        if (savedApiKey) {
          setApiKey(savedApiKey);
          setApiKeySaved(true);
        } else {
          setApiKey('');
          setApiKeySaved(false);
        }
      } catch (error) {
        console.error('Error loading API key:', error);
        setApiKey('');
        setApiKeySaved(false);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadApiKey();
  }, [user, isGuest]);

  // Save API key to Supabase or localStorage
  const saveApiKey = async () => {
    if (!user && !isGuest) {
      return { success: false, error: 'Authentication required' };
    }

    if (!apiKey.trim()) {
      return { success: false, error: 'Invalid API key' };
    }

    setIsLoadingApiKey(true);
    try {
      if (isGuest) {
        // For guest mode, save to localStorage
        localStorage.setItem('gemini_api_key', apiKey.trim());
        setApiKeySaved(true);
        return { success: true };
      } else {
        // For authenticated users, save to Supabase
        const result = await supabaseSecureStorage.storeApiKey(apiKey.trim());
        if (result.success) {
          setApiKeySaved(true);
        }
        return result;
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      return { success: false, error: 'Failed to save API key' };
    } finally {
      setIsLoadingApiKey(false);
    }
  };
  return {
    apiKey,
    setApiKey,
    apiKeySaved,
    setApiKeySaved,
    isLoadingApiKey,
    isInitialLoading,
    saveApiKey,
  };
};
