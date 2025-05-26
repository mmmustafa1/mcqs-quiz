import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Save, Check, Info, Key } from 'lucide-react';
import { supabaseSecureStorage } from '@/lib/supabaseSecureStorage';

interface GeminiAPISettingsProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  apiKeySaved: boolean;
  setApiKeySaved: (saved: boolean) => void;
}

const GeminiAPISettings: React.FC<GeminiAPISettingsProps> = ({
  apiKey,
  setApiKey,
  apiKeySaved,
  setApiKeySaved
}) => {
  const { user, isGuest } = useAuth();
  const { toast } = useToast();
  const [isLoadingApiKey, setIsLoadingApiKey] = useState(false);

  // Load saved API key on component mount and when user changes
  useEffect(() => {
    const loadApiKey = async () => {
      if (!user && !isGuest) {
        setApiKey('');
        setApiKeySaved(false);
        return;
      }

      setIsLoadingApiKey(true);
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
        setIsLoadingApiKey(false);
      }
    };

    loadApiKey();
  }, [user, isGuest, setApiKey, setApiKeySaved]);

  // Save API key to Supabase or localStorage
  const saveApiKey = async () => {
    if (!user && !isGuest) {
      toast({
        title: "Authentication Required",
        description: "Please sign in or continue as guest to save your API key.",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey.trim()) {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid API key.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingApiKey(true);
    try {
      if (isGuest) {
        // For guest mode, save to localStorage
        localStorage.setItem('gemini_api_key', apiKey.trim());
        setApiKeySaved(true);
        toast({
          title: "API Key Saved",
          description: "Your API key has been saved locally in your browser.",
        });
      } else {
        // For authenticated users, save to Supabase
        const result = await supabaseSecureStorage.storeApiKey(apiKey.trim());
        if (result.success) {
          setApiKeySaved(true);
          toast({
            title: "API Key Saved",
            description: "Your API key has been saved securely.",
          });
        } else {
          console.error('Failed to save API key:', result.error);
          toast({
            title: "Save Failed",
            description: result.error || "Failed to save API key.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        title: "Save Failed",
        description: "An unexpected error occurred while saving your API key.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingApiKey(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 p-3 rounded-md bg-background dark:bg-muted/30 border border-border">
        <div className="flex-grow space-y-3">
          <div className="space-y-1">
            <Label htmlFor="gemini-api-key" className="font-medium text-sm flex items-center gap-2">
              <Key className="h-4 w-4" />
              Google AI (Gemini) API Key
            </Label>
            <p className="text-xs text-muted-foreground">
              Required for AI-powered quiz and flashcard generation
            </p>
          </div>
          
          <div className="space-y-2">
            <Input
              id="gemini-api-key"
              type="password"
              placeholder="Enter your Google AI API key"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setApiKeySaved(false);
              }}
              className="text-xs sm:text-sm"
              disabled={isLoadingApiKey}
            />
            
            <p className="text-xs text-muted-foreground">
              <Info className="inline-block h-3 w-3 mr-1" />
              {user ? 
                "Your API key is stored securely in Supabase with encryption" :
                isGuest ?
                "Your API key is stored locally in your browser only" :
                "Sign in to store your API key securely in the cloud"
              }
            </p>
            
            <Button
              onClick={saveApiKey}
              size="sm"
              variant="secondary"
              disabled={!apiKey.trim() || apiKeySaved || isLoadingApiKey || (!user && !isGuest)}
              className="w-full sm:w-auto"
            >
              {isLoadingApiKey ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : apiKeySaved ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  API Key Saved
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {(user || isGuest) ? "Save API Key" : "Sign In Required"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-200 text-sm">How to get a Google AI API Key</AlertTitle>
        <AlertDescription className="text-blue-800 dark:text-blue-200 text-xs">
          <ol className="list-decimal pl-4 mt-2 space-y-1">
            <li>Go to <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Google AI Studio</a></li>
            <li>Sign in with your Google account</li>
            <li>Navigate to "Get API key" from the top menu</li>
            <li>Create a new API key and copy it</li>
            <li>Paste it here and click "Save API Key"</li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default GeminiAPISettings;
