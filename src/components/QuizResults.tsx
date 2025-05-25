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
    <div className="quiz-card animate-fade-in">      {/* Enhanced Header with Celebration Animation */}
      <div className="text-center mb-8">
        <div className="mb-4 flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-xl"></div>
            <div className="relative z-10 flex items-center justify-center">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center transform rotate-12">
                <div className="text-white text-lg font-bold">
                  {score >= 90 ? '★' : score >= 70 ? '✓' : score >= 50 ? '◐' : '○'}
                </div>
              </div>
            </div>
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">Quiz Complete!</h2>
        <p className="text-muted-foreground">
          {score >= 90 ? 'Outstanding performance!' : 
           score >= 70 ? 'Great job!' : 
           score >= 50 ? 'Good effort!' : 
           'Keep practicing!'}
        </p>
      </div>
      
      {/* Enhanced Score Card */}
      <div className="card-enhanced p-6 sm:p-8 mb-8">
        <div className="text-center">
          <div className={cn(
            "text-4xl sm:text-5xl font-bold mb-4 transition-all duration-1000",
            score >= 70 ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"
          )}>
            {score.toFixed(1)}%
          </div>
          <div className="text-lg sm:text-xl text-muted-foreground mb-6">
            {correctAnswers} out of {questions.length} questions correct
          </div>
            {/* Enhanced Progress Bar */}
          <div className="relative w-full bg-gray-200 dark:bg-gray-700 h-4 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-2000 ease-out progress-bar-width",
                score >= 90 ? "bg-gradient-to-r from-green-500 to-emerald-600" :
                score >= 70 ? "bg-gradient-to-r from-blue-500 to-green-500" :
                score >= 50 ? "bg-gradient-to-r from-yellow-500 to-orange-500" :
                "bg-gradient-to-r from-red-500 to-pink-500"
              )}
              style={{"--progress-width": `${score}%`} as React.CSSProperties}
            ></div>
          </div>
        </div>
      </div>      
      {/* Enhanced Question Review */}
      <div className="mb-8">
        <h3 className="text-xl sm:text-2xl font-bold gradient-text mb-6">Question Review</h3>
        
        <div className="space-y-6">
          {questions.map((question, qIndex) => {
            const selectedOption = question.options[question.userAnswerIndex!];
            const isCorrect = selectedOption?.isCorrect;
            const correctOption = question.options.find(opt => opt.isCorrect);
            
            return (
              <div key={qIndex} className="card-enhanced p-4 sm:p-6">
                <div className="flex gap-3 sm:gap-4">
                  <div className={cn(
                    "flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0 mt-1",
                    isCorrect 
                      ? "bg-gradient-to-r from-green-500 to-emerald-600" 
                      : "bg-gradient-to-r from-red-500 to-pink-600"
                  )}>
                    {isCorrect ? (
                      <Check className="text-white h-4 w-4" />
                    ) : (
                      <X className="text-white h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                      {qIndex + 1}. {question.question}
                    </h4>
                    
                    <div className="space-y-3">
                      {question.options.map((option, oIndex) => (
                        <div 
                          key={oIndex}
                          className={cn(
                            "p-3 sm:p-4 rounded-lg border-2 transition-all duration-300",
                            option.isCorrect 
                              ? "border-green-400 bg-green-50 dark:bg-green-900/20 shadow-green-100 dark:shadow-green-900/20 shadow-md" 
                              : oIndex === question.userAnswerIndex && !option.isCorrect
                                ? "border-red-400 bg-red-50 dark:bg-red-900/20 shadow-red-100 dark:shadow-red-900/20 shadow-md"
                                : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                          )}
                        >
                          <div className="flex justify-between items-center">
                            <div className="font-medium text-gray-900 dark:text-gray-100">{option.text}</div>
                            {(option.isCorrect || oIndex === question.userAnswerIndex) && (
                              <div>
                                {option.isCorrect ? (
                                  <Check className="text-green-600 dark:text-green-400 h-5 w-5" />
                                ) : (
                                  <X className="text-red-600 dark:text-red-400 h-5 w-5" />
                                )}
                              </div>
                            )}
                          </div>
                          
                          {option.explanation && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border-l-4 border-blue-400">
                              <div className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">Explanation:</div>
                              <div className="text-sm text-blue-700 dark:text-blue-300">
                                {option.explanation}
                              </div>
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
      </div>      
      {/* Enhanced Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <Button
          onClick={restartQuiz}
          className="btn-gradient flex items-center gap-2 px-6 py-3 text-lg font-semibold"
        >
          🔄 Restart Quiz
        </Button>
        <Button
          onClick={goToHome}
          variant="outline"
          className="border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-6 py-3 text-lg font-semibold transition-all duration-300"
        >
          🏠 Back to Home
        </Button>
      </div>

      {/* Enhanced Quiz Settings */}
      <div className="card-enhanced p-6">
        <h3 className="text-xl font-bold gradient-text mb-6">Quiz Settings</h3>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <div className="flex-grow">
              <span className="font-semibold text-gray-900 dark:text-gray-100">Immediate Feedback</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Show correct/incorrect answers immediately after each question
              </p>
            </div>
            <div className="flex-shrink-0">
              <Switch
                id="immediate-feedback-results"
                checked={settings.immediateFeedback}
                onCheckedChange={(checked) => updateSettings({ immediateFeedback: checked })}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <div className="flex-grow">
              <span className="font-semibold text-gray-900 dark:text-gray-100">Shuffle Questions</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Randomize the order of questions
              </p>
            </div>
            <div className="flex-shrink-0">
              <Switch
                id="shuffle-questions-results"
                checked={settings.shuffleQuestions}
                onCheckedChange={(checked) => handleShuffleSetting('shuffleQuestions', checked)}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <div className="flex-grow">
              <span className="font-semibold text-gray-900 dark:text-gray-100">Shuffle Options</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Randomize the order of answer choices
              </p>
            </div>
            <div className="flex-shrink-0">
              <Switch
                id="shuffle-options-results"
                checked={settings.shuffleOptions}
                onCheckedChange={(checked) => handleShuffleSetting('shuffleOptions', checked)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
