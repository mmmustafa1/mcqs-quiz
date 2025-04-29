import React, { useState } from 'react';
import { Menu, History, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import ThemeToggle from './ThemeToggle';

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
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden absolute top-4 left-4 z-50">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[250px] sm:w-[300px]">
        <SheetHeader>
          <SheetTitle className="text-left">MCQ Quiz Taker</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 py-6">
          <Button 
            variant="outline" 
            onClick={handleSettingsClick}
            className="justify-start"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          
          {showHistoryButton && (
            <Button 
              variant="outline" 
              onClick={handleHistoryClick}
              className="justify-start"
            >
              <History className="h-4 w-4 mr-2" />
              View Quiz History
            </Button>
          )}
          <div className="flex items-center justify-between mt-auto pt-4">
            <span className="text-sm text-muted-foreground">Toggle theme</span>
            <ThemeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavToggle;
