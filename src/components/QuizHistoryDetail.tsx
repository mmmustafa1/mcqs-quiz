import React from 'react';
import { HistoryEntry, useHistory } from '@/contexts/HistoryContext';
import { useQuiz } from '@/contexts/QuizContext';
import { Button } from '@/components/ui/button';
import { Check, X, ArrowLeft, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizHistoryDetailProps {
  entry: HistoryEntry;
  onBack: () => void; // Function to go back to the history list
  onCloseHistory: () => void; // Function to close the history view entirely (passed from QuizApp)
}

const QuizHistoryDetail: React.FC<QuizHistoryDetailProps> = ({ entry, onBack, onCloseHistory }) => {
  const { startQuizWithData } = useQuiz();
  const { deleteHistoryEntry } = useHistory(); // Get delete function if needed

  const score = (entry.score / entry.totalQuestions) * 100;

  const handleRetakeQuiz = () => {
    // Use the startQuizWithData function from QuizContext
    startQuizWithData(entry.questions, entry.settings, `Retake: ${new Date(entry.timestamp).toLocaleTimeString()}`);
    onCloseHistory(); // Close the history view after starting retake
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString(); 
  };
  return (
    <div className="quiz-card animate-fade-in">
      <div className="flex flex-row items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to history list" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl sm:text-2xl font-bold">Quiz Review</h2>
        </div>
      </div>

      {/* Score Summary */}
      <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 rounded-xl mb-6 sm:mb-8">
        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-bold mb-2">{score.toFixed(1)}%</div>
          <div className="text-sm sm:text-lg text-gray-600 dark:text-gray-400 mb-4">
            You answered {entry.score} out of {entry.totalQuestions} questions correctly
          </div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
            Taken on: {formatTimestamp(entry.timestamp)}
          </div>
        </div>        <div className="quiz-progress">
          <div 
            className={cn(
              "quiz-progress-inner",
              score >= 70 ? "bg-quiz-correct" : "bg-quiz-incorrect"
            )}
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>

      {/* Question Review */}
      <h3 className="text-base sm:text-lg font-bold mb-4">Question Details</h3>
      <div className="space-y-4 sm:space-y-6 max-h-[400px] overflow-y-auto scrollbar-webkit">
        {entry.questions.map((question, qIndex) => {
          const selectedOption = question.options[question.userAnswerIndex!];
          const isCorrect = selectedOption?.isCorrect;
          
          return (
            <div key={qIndex} className="p-4 sm:p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex gap-3 sm:gap-4">
                <div className={cn(
                  "flex items-center justify-center h-6 w-6 sm:h-7 sm:w-7 rounded-full flex-shrink-0 mt-1",
                  isCorrect ? "bg-quiz-correct" : "bg-quiz-incorrect"
                )}>
                  {isCorrect ? <Check className="text-white h-3 w-3 sm:h-4 sm:w-4" /> : <X className="text-white h-3 w-3 sm:h-4 sm:w-4" />}
                </div>
                <div className="flex-grow">
                  <h4 className="text-sm sm:text-base font-medium mb-3 sm:mb-4">
                    {qIndex + 1}. {question.question}
                  </h4>
                  <div className="space-y-2 sm:space-y-3">
                    {question.options.map((option, oIndex) => (
                      <div 
                        key={oIndex}
                        className={cn(
                          "p-2 sm:p-3 rounded-lg border text-xs sm:text-sm",
                          option.isCorrect 
                            ? "border-quiz-correct bg-green-50 dark:bg-green-900/10" 
                            : oIndex === question.userAnswerIndex && !option.isCorrect
                              ? "border-quiz-incorrect bg-red-50 dark:bg-red-900/10"
                              : "border-gray-200 dark:border-gray-700"
                        )}
                      >
                        <div className="flex justify-between items-center">
                          <span className={cn(
                            oIndex === question.userAnswerIndex ? "font-semibold" : "",
                            "flex-grow"
                          )}>
                            {option.text}
                          </span>
                          {option.isCorrect && <Check className="text-quiz-correct h-4 w-4 flex-shrink-0 ml-2" />}
                          {oIndex === question.userAnswerIndex && !option.isCorrect && <X className="text-quiz-incorrect h-4 w-4 flex-shrink-0 ml-2" />}
                        </div>
                        {option.explanation && (
                          <div className="quiz-explanation mt-2 text-xs sm:text-sm">
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

      {/* Action Button */}
      <div className="mt-6 sm:mt-8 flex justify-center">
        <Button onClick={handleRetakeQuiz} className="quiz-btn quiz-btn-primary flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          Retake Quiz
        </Button>
      </div>
    </div>
  );
};

export default QuizHistoryDetail;
