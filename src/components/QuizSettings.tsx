import React from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import { useHistory } from '@/contexts/HistoryContext'; // Import useHistory
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Shield, Info } from 'lucide-react';

interface QuizSettingsProps {
  className?: string;
  asCard?: boolean;
}

const QuizSettings: React.FC<QuizSettingsProps> = ({ 
  className = "", 
  asCard = true
}) => {
  const { settings, updateSettings } = useQuiz();
  const { isHistoryEnabled, toggleHistoryEnabled } = useHistory(); // Get history state and toggle function
  const { user, isGuest } = useAuth(); // Get authentication state

  const settingsContent = (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 p-3 rounded-md bg-background dark:bg-muted/30 border border-border">
        <div className="flex-grow">
          <Label htmlFor="immediate-feedback" className="font-medium text-sm">Immediate Feedback</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Show results after each question.
          </p>
        </div>
        <div className="flex-shrink-0">
          <Switch
            id="immediate-feedback"
            checked={settings.immediateFeedback}
            onCheckedChange={(checked) => updateSettings({ immediateFeedback: checked })}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 p-3 rounded-md bg-background dark:bg-muted/30 border border-border">
        <div className="flex-grow">
          <Label htmlFor="shuffle-questions" className="font-medium text-sm">Shuffle Questions</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Randomize question order.
          </p>
        </div>
        <div className="flex-shrink-0">
          <Switch
            id="shuffle-questions"
            checked={settings.shuffleQuestions}
            onCheckedChange={(checked) => updateSettings({ shuffleQuestions: checked })}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 p-3 rounded-md bg-background dark:bg-muted/30 border border-border">
        <div className="flex-grow">
          <Label htmlFor="shuffle-options" className="font-medium text-sm">Shuffle Options</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Randomize answer choice order.
          </p>
        </div>
        <div className="flex-shrink-0">
          <Switch
            id="shuffle-options"
            checked={settings.shuffleOptions}
            onCheckedChange={(checked) => updateSettings({ shuffleOptions: checked })}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>

      {/* Add History Toggle Setting */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 p-3 rounded-md bg-background dark:bg-muted/30 border border-border">
        <div className="flex-grow">
          <Label htmlFor="enable-history" className="font-medium text-sm">Record Quiz History</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Save results after each quiz attempt.
          </p>
        </div>
        <div className="flex-shrink-0">
          <Switch
            id="enable-history"
            checked={isHistoryEnabled}
            onCheckedChange={toggleHistoryEnabled} // Use the toggle function from context
            className="data-[state=checked]:bg-primary"          />
        </div>
      </div>      {/* Authentication Status Alert */}
      {user && (
        <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <strong>Secure Storage Active:</strong> Your API keys and settings are encrypted and stored securely in the cloud.
          </AlertDescription>
        </Alert>
      )}

      {isGuest && (
        <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>Guest Mode:</strong> Your API keys and settings are stored locally in your browser only.
          </AlertDescription>
        </Alert>
      )}

      {!user && !isGuest && (
        <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>Sign in required:</strong> Create an account to securely store your API keys and access advanced features.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  if (!asCard) {
    return settingsContent;
  }

  return (
    <Card className="border-border bg-muted/30 dark:bg-muted/20 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-base sm:text-lg font-semibold">
          <Settings className="mr-2 h-5 w-5 text-primary" />
          Quiz Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {settingsContent}
      </CardContent>
    </Card>
  );
};

export default QuizSettings;
