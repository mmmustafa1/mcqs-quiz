import React, { useEffect } from 'react'; // Added useEffect
import { useQuiz } from '@/contexts/QuizContext';
import { useHistory } from '@/contexts/HistoryContext'; // Added useHistory
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

const QuizResults = () => {
  const { questions, restartQuiz, settings, updateSettings, goToHome } = useQuiz();
  const { addHistoryEntry, isHistoryEnabled } = useHistory(); // Get history context functions

  // Handler for toggling shuffle settings (no immediate restart)
  const handleShuffleSetting = (settingKey: 'shuffleQuestions' | 'shuffleOptions', value: boolean) => {
    updateSettings({ [settingKey]: value });
  };

  const correctAnswers = questions.filter(q => 
    q.options[q.userAnswerIndex!]?.isCorrect
  ).length;
  
  const score = (correctAnswers / questions.length) * 100;

  // Save result to history when component mounts if history is enabled
  useEffect(() => {
    if (isHistoryEnabled) {
      // Pass score, total, questions array, and settings
      // This will either create a new entry or update an existing "starter" entry
      // created when the quiz was first started (for Gemini AI quizzes)
      addHistoryEntry(correctAnswers, questions.length, questions, settings); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // We only want this to run once when the results component mounts.
    // Dependencies are technically addHistoryEntry, isHistoryEnabled, correctAnswers, questions.length
    // but adding them might cause multiple saves if the component re-renders unexpectedly.
    // Assuming this component remounts cleanly each time results are shown.
  }, []); 
  
  return (
    <div className="quiz-card animate-fade-in">
      <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Quiz Results</h2>
      
      <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 rounded-xl mb-6 sm:mb-8">
        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-bold mb-2">{score.toFixed(1)}%</div>
          <div className="text-sm sm:text-lg text-gray-600 dark:text-gray-400">
            You answered {correctAnswers} out of {questions.length} questions correctly
          </div>
        </div>
        
        <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              score >= 70 ? "bg-quiz-correct" : "bg-quiz-incorrect"
            )}
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>
      
      <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Question Review</h3>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {questions.map((question, qIndex) => {
          const selectedOption = question.options[question.userAnswerIndex!];
          const isCorrect = selectedOption?.isCorrect;
          const correctOption = question.options.find(opt => opt.isCorrect);
          
          return (
            <div key={qIndex} className="py-4 sm:py-6 first:pt-0 last:pb-0">
              <div className="flex gap-2 sm:gap-3">
                <div className={cn(
                  "flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded-full flex-shrink-0 mt-1",
                  isCorrect ? "bg-quiz-correct" : "bg-quiz-incorrect"
                )}>
                  {isCorrect ? <Check className="text-white h-3 w-3 sm:h-4 sm:w-4" /> : <X className="text-white h-3 w-3 sm:h-4 sm:w-4" />}
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">
                    {qIndex + 1}. {question.question}
                  </h4>
                  
                  <div className="space-y-2 sm:space-y-3 ml-1 sm:ml-2">
                    {question.options.map((option, oIndex) => (
                      <div 
                        key={oIndex}
                        className={cn(
                          "p-2 sm:p-3 rounded-lg border text-sm sm:text-base",
                          option.isCorrect 
                            ? "border-quiz-correct bg-green-50 dark:bg-green-900/10" 
                            : oIndex === question.userAnswerIndex && !option.isCorrect
                              ? "border-quiz-incorrect bg-red-50 dark:bg-red-900/10"
                              : "border-gray-200 dark:border-gray-700"
                        )}
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{option.text}</div>
                          {(option.isCorrect || oIndex === question.userAnswerIndex) && (
                            <div>
                              {option.isCorrect ? (
                                <Check className="text-quiz-correct h-4 w-4 sm:h-5 sm:w-5" />
                              ) : (
                                <X className="text-quiz-incorrect h-4 w-4 sm:h-5 sm:w-5" />
                              )}
                            </div>
                          )}
                        </div>
                        
                        {option.explanation && (
                          <div className="quiz-explanation mt-1 sm:mt-2 text-xs sm:text-sm">
                            {option.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <Button
          onClick={restartQuiz}
          className="quiz-btn quiz-btn-primary"
        >
          Restart Quiz
        </Button>
        <Button
          onClick={goToHome}
          variant="outline"
          className="quiz-btn"
        >
          Back to Home
        </Button>
      </div>

      {/* Quiz Settings (like on start screen) */}
      <div className="mt-6 sm:mt-8">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Quiz Settings</h2>
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <div className="pr-4">
              <span className="font-medium text-sm sm:text-base">Immediate Feedback</span>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Show correct/incorrect answers immediately after each question
              </p>
            </div>
            <Switch
              id="immediate-feedback-results"
              checked={settings.immediateFeedback}
              onCheckedChange={(checked) => updateSettings({ immediateFeedback: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Shuffle Questions</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Randomize the order of questions
              </p>
            </div>
            <Switch
              id="shuffle-questions-results"
              checked={settings.shuffleQuestions}
              onCheckedChange={(checked) => handleShuffleSetting('shuffleQuestions', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Shuffle Options</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Randomize the order of answer choices
              </p>
            </div>
            <Switch
              id="shuffle-options-results"
              checked={settings.shuffleOptions}
              onCheckedChange={(checked) => handleShuffleSetting('shuffleOptions', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
