import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Share, XCircle } from 'lucide-react';
import { Card } from './ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      setIsPWA(true);
      return;
    }

    // Check for iOS Safari
    const isAppleDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    setIsIOS(isAppleDevice);
    setIsSafari(isSafariBrowser && isAppleDevice);

    // For Chrome, Edge, etc.
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Only show the prompt if the user hasn't dismissed it before
      const hasUserDismissed = localStorage.getItem('pwaPromptDismissed');
      if (!hasUserDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed or viewed 3+ times without installing
    const visitCount = parseInt(localStorage.getItem('visitCount') || '0', 10);
    localStorage.setItem('visitCount', (visitCount + 1).toString());

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choiceResult = await installPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
      localStorage.setItem('pwaPromptDismissed', 'true');
    }
    
    setInstallPrompt(null);
    setShowPrompt(false);
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('pwaPromptDismissed', 'true');
  };

  if (!showPrompt || isPWA) return null;

  return (
    <div className="fixed bottom-4 inset-x-0 mx-auto w-[90%] max-w-md z-50 animate-fadeIn">
      <Card className="relative p-4 shadow-lg border-primary/20">
        <button 
          onClick={dismissPrompt}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <XCircle className="h-5 w-5" />
        </button>
        
        <h3 className="font-bold text-base mb-2">Add to Home Screen</h3>
        
        {isIOS && isSafari ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Install this app on your device for quick access and offline use:
            </p>
            <div className="flex items-center text-xs text-muted-foreground space-x-2">
              <span>1. Tap</span>
              <Share className="h-4 w-4" />
              <span>then "Add to Home Screen"</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Install this app on your device for quick access and offline use.
            </p>
            <Button 
              onClick={handleInstallClick} 
              className="w-full flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Install App
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;
