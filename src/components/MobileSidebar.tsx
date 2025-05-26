import React, { useState } from 'react';
import { Menu, X, Settings, Edit2, Lock, LogOut, LogIn, History, Layers, User, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ThemeToggle from './ThemeToggle';
import { EditDisplayName } from './EditDisplayName';
import { ChangePassword } from './ChangePassword';
import { useAuth } from '@/contexts/AuthContext';

interface MobileSidebarProps {
  onShowHistory?: () => void;
  onShowFlashcardHistory?: () => void;
  onOpenSettings?: () => void;
  currentView: 'home' | 'flashcards';
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ 
  onShowHistory,
  onShowFlashcardHistory,
  onOpenSettings,
  currentView
}) => {
  const [open, setOpen] = useState(false);
  const { user, isGuest, signOut, exitGuestMode, guestDisplayName, profile } = useAuth();

  const handleHistoryClick = () => {
    if (onShowHistory) {
      onShowHistory();
      setOpen(false);
    }
  };

  const handleFlashcardHistoryClick = () => {
    if (onShowFlashcardHistory) {
      onShowFlashcardHistory();
      setOpen(false);
    }
  };

  const handleSettingsClick = () => {
    if (onOpenSettings) {
      onOpenSettings();
      setOpen(false);
    }
  };

  const displayName = user ? (profile?.display_name || user.email?.split('@')[0] || 'User') : (guestDisplayName || 'Guest User');
  const userInitial = user ? user.email?.charAt(0).toUpperCase() : 'G';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden absolute top-4 left-4 z-50">
        <Button 
          variant="ghost" 
          size="icon" 
          className="glass-card hover:bg-white/20 dark:hover:bg-gray-800/20 backdrop-blur-sm"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="left" 
        className="w-[300px] sm:w-[350px] bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-r border-gray-200/30 dark:border-gray-700/30 p-0"
      >
        {/* Header */}
        <SheetHeader className="p-6 pb-4 border-b border-gray-200/20 dark:border-gray-700/20">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-xl"></div>
                <div className="relative z-10 text-white text-lg font-bold">Q</div>
              </div>
              <div>
                <div className="gradient-text font-bold text-lg">MCQ Quiz Taker</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">Study & Quiz Platform</div>
              </div>
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Profile Section */}
          {(user || isGuest) && (
            <div className="p-6 pb-4">
              <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/80 rounded-2xl p-4 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-14 h-14 ring-2 ring-blue-100 dark:ring-blue-900/50">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-bold">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-base">
                        {displayName}
                      </h3>
                      {isGuest && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                          Guest
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {user ? user.email : 'Local storage mode'}
                    </p>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/30 transition-colors">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</span>
                    <EditDisplayName 
                      currentDisplayName={displayName}
                      isGuest={isGuest}
                      trigger={
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      }
                    />
                  </div>
                  
                  {user && (
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/30 transition-colors">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</span>
                      <ChangePassword 
                        trigger={
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                            <Lock className="h-3 w-3 mr-1" />
                            Change
                          </Button>
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <div className="flex-1 px-6">
            <div className="space-y-1">
              {/* Settings */}
              <Button 
                variant="ghost" 
                onClick={handleSettingsClick}
                className="w-full justify-start h-12 px-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left rounded-xl group"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">Settings</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Button>

              {/* Quiz History */}
              <Button 
                variant="ghost" 
                onClick={handleHistoryClick}
                className="w-full justify-start h-12 px-4 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-left rounded-xl group"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                    <History className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="font-medium">Quiz History</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Button>

              {/* Flashcard History */}
              <Button 
                variant="ghost" 
                onClick={handleFlashcardHistoryClick}
                className="w-full justify-start h-12 px-4 hover:bg-green-50 dark:hover:bg-green-900/20 text-left rounded-xl group"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                    <Layers className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-medium">Flashcard History</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Button>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="p-6 pt-4">
            {/* Theme Toggle */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-sm">🌙</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
                </div>
                <ThemeToggle />
              </div>
            </div>

            {/* Sign Out/Sign Up */}
            {(user || isGuest) && (
              <div className="space-y-2">
                <Separator className="my-2" />
                {isGuest ? (
                  <Button 
                    variant="outline" 
                    className="w-full h-11 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    onClick={() => {
                      exitGuestMode();
                      setOpen(false);
                    }}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign Up / Sign In
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full h-11 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={async () => {
                      await signOut();
                      setOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
