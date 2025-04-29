import React from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import { useHistory } from '@/contexts/HistoryContext'; // Import useHistory
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

const QuizSettings = () => {
  const { settings, updateSettings } = useQuiz();
  const { isHistoryEnabled, toggleHistoryEnabled } = useHistory(); // Get history state and toggle function

  return (
    <Card className="border-border bg-muted/30 dark:bg-muted/20 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg font-semibold">
          <Settings className="mr-2 h-5 w-5 text-primary" />
          Quiz Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="flex items-center justify-between p-3 rounded-md bg-background dark:bg-muted/30 border border-border">
          <div className="flex-grow pr-4">
            <Label htmlFor="immediate-feedback" className="font-medium text-sm">Immediate Feedback</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Show results after each question.
            </p>
          </div>
          <Switch
            id="immediate-feedback"
            checked={settings.immediateFeedback}
            onCheckedChange={(checked) => updateSettings({ immediateFeedback: checked })}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-md bg-background dark:bg-muted/30 border border-border">
          <div className="flex-grow pr-4">
            <Label htmlFor="shuffle-questions" className="font-medium text-sm">Shuffle Questions</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Randomize question order.
            </p>
          </div>
          <Switch
            id="shuffle-questions"
            checked={settings.shuffleQuestions}
            onCheckedChange={(checked) => updateSettings({ shuffleQuestions: checked })}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-md bg-background dark:bg-muted/30 border border-border">
          <div className="flex-grow pr-4">
            <Label htmlFor="shuffle-options" className="font-medium text-sm">Shuffle Options</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Randomize answer choice order.
            </p>
          </div>
          <Switch
            id="shuffle-options"
            checked={settings.shuffleOptions}
            onCheckedChange={(checked) => updateSettings({ shuffleOptions: checked })}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        {/* Add History Toggle Setting */}
        <div className="flex items-center justify-between p-3 rounded-md bg-background dark:bg-muted/30 border border-border">
          <div className="flex-grow pr-4">
            <Label htmlFor="enable-history" className="font-medium text-sm">Record Quiz History</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Save results after each quiz attempt.
            </p>
          </div>
          <Switch
            id="enable-history"
            checked={isHistoryEnabled}
            onCheckedChange={toggleHistoryEnabled} // Use the toggle function from context
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizSettings;
