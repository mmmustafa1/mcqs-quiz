import React, { useState } from 'react';
import { Menu, History, X, Settings, Edit2, Lock, LogOut, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import ThemeToggle from './ThemeToggle';
import { EditDisplayName } from './EditDisplayName';
import { ChangePassword } from './ChangePassword';
import { useAuth } from '@/contexts/AuthContext';

interface MobileNavToggleProps {
  onShowHistory?: () => void;
  showHistoryButton?: boolean;
  onOpenSettings?: () => void;
}

const MobileNavToggle: React.FC<MobileNavToggleProps> = ({ 
  onShowHistory,
  showHistoryButton = false,
  onOpenSettings
}) => {
  const [open, setOpen] = useState(false);
  const { user, isGuest, signOut, exitGuestMode, guestDisplayName, profile } = useAuth();

  const handleHistoryClick = () => {
    if (onShowHistory) {
      onShowHistory();
      setOpen(false);
    }
  };

  const handleSettingsClick = () => {
    if (onOpenSettings) {
      onOpenSettings();
      setOpen(false);
    }
  };  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden absolute top-4 left-4 z-50">
        <Button variant="ghost" size="icon" className="glass-card hover:bg-white/20 dark:hover:bg-gray-800/20">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/20 dark:border-gray-700/20">
        <SheetHeader className="pb-6 border-b border-gray-200/20 dark:border-gray-700/20">
          <SheetTitle className="text-left flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-lg"></div>
              <div className="relative z-10 text-white text-sm font-bold">Q</div>
            </div>
            <span className="gradient-text font-bold">MCQ Quiz Taker</span>
          </SheetTitle>
        </SheetHeader>        <div className="flex flex-col gap-4 py-6">
          {/* Mobile Profile Section - Enhanced */}
          {(user || isGuest) && (
            <div className="card-enhanced p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">
                    {user ? user.email?.charAt(0).toUpperCase() : 'G'}
                  </span>
                </div>                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {user ? (profile?.display_name || user.email?.split('@')[0] || 'User') : 
                       (guestDisplayName || 'Guest User')}
                    </h3>
                    {isGuest && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
                        Guest
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {user ? user.email : 'Local storage mode'}
                  </p>
                </div>
              </div>              
              {/* Profile Edit Actions */}
              <div className="mt-4 pt-4 border-t border-gray-200/20 dark:border-gray-700/20">
                <div className="space-y-2">
                  {/* Edit Display Name */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</span>
                    <EditDisplayName 
                      currentDisplayName={user ? (profile?.display_name || user.email?.split('@')[0] || 'User') : guestDisplayName}
                      isGuest={isGuest}
                      trigger={
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      }
                    />
                  </div>
                  
                  {/* Change Password - Only for authenticated users */}
                  {user && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</span>
                      <ChangePassword 
                        trigger={
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Change
                          </Button>
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Sign Out/Sign Up Actions */}
              <div className="mt-4 pt-4 border-t border-gray-200/20 dark:border-gray-700/20">
                <div className="flex gap-2">
                  {isGuest ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs"
                      onClick={() => {
                        exitGuestMode();
                        setOpen(false);
                      }}
                    >
                      <LogIn className="h-3 w-3 mr-1" />
                      Sign Up
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={async () => {
                        await signOut();
                        setOpen(false);
                      }}
                    >
                      <LogOut className="h-3 w-3 mr-1" />
                      Sign Out
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation Menu */}
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              onClick={handleSettingsClick}
              className="w-full justify-start h-12 px-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left"
            >
              <Settings className="h-5 w-5 mr-3 text-blue-600 dark:text-blue-400" />
              <span className="font-medium">Settings</span>
            </Button>
            
            {showHistoryButton && (
              <Button 
                variant="ghost" 
                onClick={handleHistoryClick}
                className="w-full justify-start h-12 px-4 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-left"
              >
                <History className="h-5 w-5 mr-3 text-purple-600 dark:text-purple-400" />
                <span className="font-medium">View Quiz History</span>
              </Button>
            )}
          </div>
          
          {/* Theme Toggle Section */}
          <div className="mt-auto pt-6 border-t border-gray-200/20 dark:border-gray-700/20">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavToggle;
