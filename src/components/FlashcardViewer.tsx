import React, { useState, useEffect, useCallback } from 'react';
import { useFlashcard } from '@/hooks/useFlashcard';
import { useFlashcardHistory } from '@/contexts/FlashcardHistoryContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Play, 
  Pause,
  Home,
  Trophy,
  Clock,
  Target,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import './flashcard.css';

const FlashcardViewer = () => {
  const {
    currentDeck,
    currentCard,
    currentCardIndex,
    studySession,
    isStudying,
    showAnswer,
    settings,
    startStudySession,
    endStudySession,
    nextCard,
    previousCard,
    toggleAnswer,
    markCard,
    resetSession,
    clearDeck,
  } = useFlashcard();
  
  const { addHistoryEntry, isHistoryEnabled } = useFlashcardHistory();const [isFlipping, setIsFlipping] = useState(false);
  const [autoFlipTimer, setAutoFlipTimer] = useState<NodeJS.Timeout | null>(null);
  const [cardMarked, setCardMarked] = useState(false);
  const [showCardResults, setShowCardResults] = useState(false);
  // Reset cardMarked when moving to a new card
  useEffect(() => {
    setCardMarked(false);
  }, [currentCardIndex]);
  // Record completed study session to history
  useEffect(() => {
    if (studySession?.isFinished && currentDeck && isHistoryEnabled) {
      console.log('Recording flashcard session to history:', studySession);
      addHistoryEntry(currentDeck, studySession, settings);
    }
  }, [studySession, currentDeck, settings, addHistoryEntry, isHistoryEnabled]);
  const handleFlip = useCallback(() => {
    if (isFlipping) return;
    
    setIsFlipping(true);
    setTimeout(() => {
      toggleAnswer();
      setIsFlipping(false);
    }, 150);
  }, [isFlipping, toggleAnswer]);

  // Auto-flip functionality
  useEffect(() => {
    if (settings.autoFlip && isStudying && !showAnswer) {
      const timer = setTimeout(() => {
        handleFlip();
      }, settings.autoFlipDelay * 1000);
      
      setAutoFlipTimer(timer);
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
    
    return () => {
      if (autoFlipTimer) {
        clearTimeout(autoFlipTimer);
        setAutoFlipTimer(null);
      }
    };
  }, [settings.autoFlip, settings.autoFlipDelay, isStudying, showAnswer, currentCardIndex, handleFlip, autoFlipTimer]);
  const handleMarkCorrect = () => {
    markCard(true);
    setCardMarked(true);
  };

  const handleMarkIncorrect = () => {
    markCard(false);
    setCardMarked(true);
  };

  const handlePrevious = () => {
    if (autoFlipTimer) {
      clearTimeout(autoFlipTimer);
      setAutoFlipTimer(null);
    }
    setCardMarked(false);
    previousCard();
  };

  const handleNext = () => {
    if (autoFlipTimer) {
      clearTimeout(autoFlipTimer);
      setAutoFlipTimer(null);
    }
    setCardMarked(false);
    nextCard();
  };

  if (!currentDeck) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No flashcard deck loaded.</p>
      </div>
    );
  }

  if (!isStudying && !studySession?.isFinished) {
    return (
      <div className="space-y-6">
        {/* Deck Overview */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{currentDeck.title}</h2>
                {currentDeck.description && (
                  <p className="text-muted-foreground mt-2">{currentDeck.description}</p>
                )}
              </div>
              
              <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  {currentDeck.flashcards.length} cards
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  ~{Math.ceil(currentDeck.flashcards.length * 0.5)} min
                </div>
              </div>              <div className="flex justify-center gap-3">
                <Button onClick={startStudySession} size="lg" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Start Studying
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={clearDeck}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create New Deck
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Card */}
        {currentCard && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-muted-foreground">Preview</h3>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
                  <div className="text-lg font-medium mb-4">{currentCard.front}</div>
                  <div className="text-muted-foreground border-t pt-4">
                    {currentCard.back}
                  </div>
                </div>
                <div className="flex justify-center gap-2">
                  <Badge variant="secondary">{currentCard.difficulty}</Badge>
                  <Badge variant="outline">{currentCard.category}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (studySession?.isFinished) {
    const accuracy = studySession.reviewedCards > 0 
      ? Math.round((studySession.correctCards / studySession.reviewedCards) * 100)
      : 0;

    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h2 className="text-3xl font-bold mb-2">Study Session Complete!</h2>
                <p className="text-muted-foreground">Great job reviewing your flashcards</p>
              </div>              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{studySession.reviewedCards}</div>
                  <div className="text-sm text-muted-foreground">Cards Reviewed</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{studySession.correctCards}</div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{studySession.incorrectCards}</div>
                  <div className="text-sm text-muted-foreground">Incorrect</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{accuracy}%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
              </div>              {studySession.skippedCards > 0 && (
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/20 rounded-lg">
                  <div className="text-lg font-bold text-gray-600">{studySession.skippedCards}</div>
                  <div className="text-sm text-muted-foreground">Cards Skipped</div>
                </div>
              )}

              {/* Individual Card Results - Collapsible */}
              {studySession.cardResults.length > 0 && (
                <Collapsible open={showCardResults} onOpenChange={setShowCardResults}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <span>View Individual Card Results ({studySession.cardResults.length} cards)</span>
                      {showCardResults ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 mt-4">
                    <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-4">
                      {studySession.cardResults.map((result, index) => (
                        <div 
                          key={result.cardId} 
                          className={`p-3 rounded-lg border-l-4 ${
                            result.result === 'correct' 
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                              : result.result === 'incorrect'
                              ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                              : 'bg-gray-50 dark:bg-gray-800/20 border-gray-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {result.cardFront}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {result.cardBack}
                              </div>
                            </div>
                            <div className="ml-3 flex-shrink-0">
                              {result.result === 'correct' && (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              )}
                              {result.result === 'incorrect' && (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                              {result.result === 'skipped' && (
                                <div className="h-5 w-5 rounded-full bg-gray-400 flex items-center justify-center">
                                  <span className="text-xs text-white">-</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              <div className="flex justify-center gap-4">
                <Button onClick={resetSession} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Study Again
                </Button>
                <Button onClick={() => window.location.reload()}>
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = currentDeck.flashcards.length > 0 
    ? ((currentCardIndex + 1) / currentDeck.flashcards.length) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      {settings.showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Card {currentCardIndex + 1} of {currentDeck.flashcards.length}</span>
            {studySession && (
              <span>
                Correct: {studySession.correctCards} | 
                Incorrect: {studySession.incorrectCards}
              </span>
            )}
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      {/* Flashcard */}
      {currentCard && (
        <div className="relative">
          <Card className="min-h-[300px] cursor-pointer" onClick={handleFlip}>
            <CardContent className="p-0">              <div 
                className={cn(
                  "flashcard-inner min-h-[300px] transition-transform duration-300",
                  showAnswer && "flashcard-flipped",
                  isFlipping && "animate-pulse"
                )}
              >
                {/* Front of card */}
                <div 
                  className={cn(
                    "flashcard-face flashcard-front p-8 flex flex-col justify-center",
                    "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
                    "border-gray-200 dark:border-gray-700"
                  )}
                >
                  <div className="text-center space-y-4">
                    <div className="text-sm text-muted-foreground font-medium">QUESTION</div>
                    <div className="text-xl font-semibold leading-relaxed">
                      {currentCard.front}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Click to reveal answer
                    </div>
                  </div>
                </div>

                {/* Back of card */}
                <div 
                  className={cn(
                    "flashcard-face flashcard-back p-8 flex flex-col justify-center",
                    "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
                    "border-gray-200 dark:border-gray-700"
                  )}
                >
                  <div className="text-center space-y-4">
                    <div className="text-sm text-muted-foreground font-medium">ANSWER</div>
                    <div className="text-lg leading-relaxed">
                      {currentCard.back}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Info */}
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="secondary">{currentCard.difficulty}</Badge>
            <Badge variant="outline">{currentCard.category}</Badge>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="space-y-4">
        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentCardIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <Button
            variant="outline"
            onClick={handleFlip}
            disabled={isFlipping}
          >
            {showAnswer ? 'Show Question' : 'Show Answer'}
          </Button>          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentCardIndex >= currentDeck.flashcards.length - 1}
            className={cn(
              showAnswer && !cardMarked && isStudying && 
              "border-orange-200 text-orange-600 hover:bg-orange-50"
            )}
          >
            {showAnswer && !cardMarked && isStudying ? (
              <>
                Skip
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Marking buttons - only show when answer is visible */}
        {showAnswer && isStudying && (
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={handleMarkIncorrect}
              className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4" />
              Incorrect
            </Button>
            <Button
              variant="outline"
              onClick={handleMarkCorrect}
              className="flex items-center gap-2 border-green-200 text-green-600 hover:bg-green-50"
            >
              <CheckCircle className="h-4 w-4" />
              Correct
            </Button>
          </div>
        )}

        {/* Session controls */}
        <div className="flex justify-center gap-2">
          <Button variant="ghost" size="sm" onClick={resetSession}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restart
          </Button>
          {isStudying && (
            <Button variant="ghost" size="sm" onClick={endStudySession}>
              <Pause className="h-4 w-4 mr-2" />
              End Session
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashcardViewer;
