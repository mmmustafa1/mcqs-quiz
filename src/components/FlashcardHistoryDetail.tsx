import React from 'react';
import { FlashcardHistoryEntry, useFlashcardHistory } from '@/contexts/FlashcardHistoryContext';
import { useFlashcard } from '@/hooks/useFlashcard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Clock, Target, Brain, Check, X, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlashcardHistoryDetailProps {
  entry: FlashcardHistoryEntry;
  onBack: () => void;
  onCloseHistory: () => void;
}

const FlashcardHistoryDetail: React.FC<FlashcardHistoryDetailProps> = ({ 
  entry, 
  onBack, 
  onCloseHistory 
}) => {
  const { loadDeck } = useFlashcard();

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Helper function to format study time
  const formatStudyTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const handleRetakeFlashcards = () => {
    // Load the deck from the history entry to restart the study session
    loadDeck(entry.deck);
    onCloseHistory(); // Close the history view after starting retake
  };

  return (
    <div className="quiz-card animate-fade-in">
      <div className="flex flex-row items-center justify-between mb-3 sm:mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to history list" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl sm:text-2xl font-bold">Flashcard Session Review</h2>
        </div>
      </div>

      {/* Session Summary */}
      <div className="p-3 sm:p-6 bg-gray-50 dark:bg-gray-800 rounded-xl mb-4 sm:mb-8">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center shadow-lg",
              entry.accuracy >= 90 ? "bg-gradient-to-r from-green-500 to-emerald-600" :
              entry.accuracy >= 70 ? "bg-gradient-to-r from-blue-500 to-green-500" :
              entry.accuracy >= 50 ? "bg-gradient-to-r from-yellow-500 to-orange-500" :
              "bg-gradient-to-r from-red-500 to-pink-500"
            )}>
              <Trophy className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <div className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">{entry.accuracy}%</div>
          <div className="text-xs sm:text-lg text-gray-600 dark:text-gray-400 mb-2 sm:mb-4">
            You got {entry.correctCards} out of {entry.reviewedCards} cards correct
          </div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-4">
            Deck: {entry.deckTitle}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-4">
            Studied on: {formatTimestamp(entry.timestamp)}
          </div>
        </div>        <div className="quiz-progress">
          <div 
            className={cn(
              "quiz-progress-inner",
              `progress-fill-${Math.round(entry.accuracy / 5) * 5}`,
              entry.accuracy >= 70 ? "bg-quiz-correct" : "bg-quiz-incorrect"
            )}
          ></div>
        </div>
      </div>

      {/* Study Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card-enhanced p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Target className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-lg font-semibold text-green-600">{entry.correctCards}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Correct</div>
        </div>
        
        <div className="card-enhanced p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <X className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-lg font-semibold text-red-600">{entry.incorrectCards}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Incorrect</div>
        </div>
        
        <div className="card-enhanced p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-lg font-semibold text-blue-600">{formatStudyTime(entry.studyTime)}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Study Time</div>
        </div>
        
        <div className="card-enhanced p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Brain className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-lg font-semibold text-purple-600">{entry.totalCards}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Total Cards</div>
        </div>
      </div>

      {/* Card Results Review */}
      <h3 className="text-sm sm:text-lg font-bold mb-3 sm:mb-4">Card Review</h3>
      <div className="space-y-3 sm:space-y-4 max-h-[40vh] sm:max-h-[300px] overflow-y-auto scrollbar-webkit">
        {entry.session.cardResults.map((cardResult, index) => {
          const isCorrect = cardResult.result === 'correct';
          const isSkipped = cardResult.result === 'skipped';
          
          return (
            <div key={index} className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex gap-2 sm:gap-4">
                <div className={cn(
                  "flex items-center justify-center h-5 w-5 sm:h-7 sm:w-7 rounded-full flex-shrink-0 mt-1",
                  isCorrect ? "bg-quiz-correct" : isSkipped ? "bg-gray-500" : "bg-quiz-incorrect"
                )}>
                  {isCorrect ? (
                    <Check className="text-white h-3 w-3 sm:h-4 sm:w-4" />
                  ) : isSkipped ? (
                    <span className="text-white text-xs">-</span>
                  ) : (
                    <X className="text-white h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </div>
                <div className="flex-grow">
                  <h4 className="text-xs sm:text-base font-medium mb-2 sm:mb-3">
                    {cardResult.cardFront}
                  </h4>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <strong>Answer:</strong> {cardResult.cardBack}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                    <span className={cn(
                      "font-medium",
                      isCorrect ? "text-green-600" : isSkipped ? "text-gray-600" : "text-red-600"
                    )}>
                      {isCorrect ? "Correct" : isSkipped ? "Skipped" : "Incorrect"}
                    </span>
                    {cardResult.timeSpent && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {cardResult.timeSpent}s
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Button */}
      <div className="mt-4 sm:mt-8 flex justify-center">
        <Button 
          onClick={handleRetakeFlashcards} 
          className="quiz-btn quiz-btn-primary flex items-center gap-2 text-sm sm:text-base"
        >
          <RotateCcw className="h-4 w-4" />
          Study This Deck Again
        </Button>
      </div>
    </div>
  );
};

export default FlashcardHistoryDetail;
