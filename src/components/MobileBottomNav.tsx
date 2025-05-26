import React from 'react';
import { Home, FileText, Sparkles, Layers, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  currentView: 'home' | 'flashcards';
  currentTab: 'manual' | 'ai' | 'flashcards';
  onViewChange: (view: 'home' | 'flashcards') => void;
  onTabChange: (tab: 'manual' | 'ai' | 'flashcards') => void;
  onOpenSettings: () => void;
  isQuizActive: boolean;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  currentTab,
  onViewChange,
  onTabChange,
  onOpenSettings,
  isQuizActive
}) => {
  // Don't show bottom nav during active quiz/flashcard sessions
  if (isQuizActive) {
    return null;
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'manual': return FileText;
      case 'ai': return Sparkles;
      case 'flashcards': return Layers;
      default: return FileText;
    }
  };

  const getTabColor = (tab: string) => {
    switch (tab) {
      case 'manual': return 'text-blue-600 dark:text-blue-400';
      case 'ai': return 'text-purple-600 dark:text-purple-400';
      case 'flashcards': return 'text-green-600 dark:text-green-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-padding">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          {/* Home/Manual Tab */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onViewChange('home');
              onTabChange('manual');
            }}
            className={cn(
              "flex flex-col items-center gap-1 h-14 px-1 rounded-lg transition-all duration-200",
              currentView === 'home' && currentTab === 'manual'
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            )}
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs font-medium">Manual</span>
          </Button>

          {/* AI Tab */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onViewChange('home');
              onTabChange('ai');
            }}
            className={cn(
              "flex flex-col items-center gap-1 h-14 px-1 rounded-lg transition-all duration-200",
              currentView === 'home' && currentTab === 'ai'
                ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                : "text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            )}
          >
            <Sparkles className="h-5 w-5" />
            <span className="text-xs font-medium">AI</span>
          </Button>

          {/* Flashcards Tab */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onViewChange('flashcards');
              onTabChange('flashcards');
            }}
            className={cn(
              "flex flex-col items-center gap-1 h-14 px-1 rounded-lg transition-all duration-200",
              currentView === 'flashcards'
                ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                : "text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
            )}
          >
            <Layers className="h-5 w-5" />
            <span className="text-xs font-medium">Cards</span>
          </Button>          {/* Settings Tab */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className="flex flex-col items-center gap-1 h-14 px-1 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs font-medium">Settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;
