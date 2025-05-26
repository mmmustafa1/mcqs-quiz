import React from 'react';
import { useFlashcard } from '@/hooks/useFlashcard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Settings, Clock, Shuffle, Eye, Filter } from 'lucide-react';
import GeminiAPISettings from './GeminiAPISettings';
import { useGeminiAPI } from '@/hooks/useGeminiAPI';

interface FlashcardSettingsProps {
  asCard?: boolean;
}

const FlashcardSettings = ({ asCard = true }: FlashcardSettingsProps) => {
  const { settings, updateSettings } = useFlashcard();
  const { apiKey, setApiKey, apiKeySaved, setApiKeySaved } = useGeminiAPI();

  const content = (
    <div className="space-y-6">
      {/* Study Mode */}
      <div className="space-y-3">
        <Label className="text-base font-medium flex items-center gap-2">
          <Shuffle className="h-4 w-4" />
          Study Mode
        </Label>        <Select 
          value={settings.studyMode} 
          onValueChange={(value: 'sequential' | 'random' | 'spaced-repetition') => updateSettings({ studyMode: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sequential">Sequential</SelectItem>
            <SelectItem value="random">Random</SelectItem>
            <SelectItem value="spaced-repetition">Spaced Repetition</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Choose how cards are presented during study sessions.
        </p>
      </div>

      {/* Shuffle Cards */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label className="text-base font-medium flex items-center gap-2">
            <Shuffle className="h-4 w-4" />
            Shuffle Cards
          </Label>
          <p className="text-sm text-muted-foreground">
            Randomize card order at the start of each session
          </p>
        </div>
        <Switch
          checked={settings.shuffleCards}
          onCheckedChange={(checked) => updateSettings({ shuffleCards: checked })}
        />
      </div>

      {/* Show Progress */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label className="text-base font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Show Progress
          </Label>
          <p className="text-sm text-muted-foreground">
            Display progress bar and card counters
          </p>
        </div>
        <Switch
          checked={settings.showProgress}
          onCheckedChange={(checked) => updateSettings({ showProgress: checked })}
        />
      </div>

      {/* Auto Flip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Auto Flip
            </Label>
            <p className="text-sm text-muted-foreground">
              Automatically reveal answers after a delay
            </p>
          </div>
          <Switch
            checked={settings.autoFlip}
            onCheckedChange={(checked) => updateSettings({ autoFlip: checked })}
          />
        </div>
        
        {settings.autoFlip && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Auto Flip Delay: {settings.autoFlipDelay} seconds
            </Label>
            <Slider
              value={[settings.autoFlipDelay]}
              onValueChange={(value) => updateSettings({ autoFlipDelay: value[0] })}
              max={10}
              min={1}
              step={0.5}
              className="w-full"
            />
          </div>
        )}
      </div>      {/* Difficulty Filter */}
      <div className="space-y-3">
        <Label className="text-base font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Difficulty Filter
        </Label>        <Select 
          value={settings.difficultyFilter} 
          onValueChange={(value: 'all' | 'easy' | 'medium' | 'hard') => updateSettings({ difficultyFilter: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="easy">Easy Only</SelectItem>
            <SelectItem value="medium">Medium Only</SelectItem>
            <SelectItem value="hard">Hard Only</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Filter cards by difficulty level during study sessions.
        </p>
      </div>

      {/* Gemini API Settings */}
      <div className="space-y-2">
        <h3 className="text-base font-medium text-foreground">AI Integration</h3>
        <GeminiAPISettings 
          apiKey={apiKey}
          setApiKey={setApiKey}
          apiKeySaved={apiKeySaved}
          setApiKeySaved={setApiKeySaved}
        />
      </div>
    </div>
  );

  if (!asCard) {
    return content;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Flashcard Settings
        </CardTitle>
        <CardDescription>
          Customize your flashcard study experience.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};

export default FlashcardSettings;
