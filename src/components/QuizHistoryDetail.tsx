import React from 'react';
import { HistoryEntry, useHistory } from '@/contexts/HistoryContext';
import { useQuiz } from '@/contexts/QuizContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
    <Card className="quiz-card animate-fade-in w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to history list" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <CardTitle className="inline-block">Quiz Review - {formatTimestamp(entry.timestamp)}</CardTitle>
        </div>
        {/* Optional: Add delete button here too? */}
        {/* <Button variant="ghost" size="icon" onClick={() => deleteHistoryEntry(entry.id)} aria-label="Delete this entry">
          <Trash2 className="h-5 w-5 text-red-500" />
        </Button> */}
      </CardHeader>
      <CardContent>
        {/* Score Summary */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">{score.toFixed(1)}%</div>
            <div className="text-md text-gray-600 dark:text-gray-400">
              Answered {entry.score} out of {entry.totalQuestions} questions correctly
            </div>
          </div>
          <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
            <div 
              className={cn(
                "h-full rounded-full",
                score >= 70 ? "bg-quiz-correct" : "bg-quiz-incorrect"
              )}
              style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>

        {/* Question Review */}
        <h3 className="text-lg font-semibold mb-3">Question Details</h3>
        <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto pr-2">
          {entry.questions.map((question, qIndex) => {
            const selectedOption = question.options[question.userAnswerIndex!];
            const isCorrect = selectedOption?.isCorrect;
            
            return (
              <div key={qIndex} className="py-4 first:pt-0 last:pb-0">
                <div className="flex gap-3">
                  <div className={cn(
                    "flex items-center justify-center h-5 w-5 rounded-full flex-shrink-0 mt-1",
                    isCorrect ? "bg-quiz-correct" : "bg-quiz-incorrect"
                  )}>
                    {isCorrect ? <Check className="text-white h-3 w-3" /> : <X className="text-white h-3 w-3" />}
                  </div>
                  <div>
                    <h4 className="text-md font-medium mb-2">
                      {qIndex + 1}. {question.question}
                    </h4>
                    <div className="space-y-2 ml-1">
                      {question.options.map((option, oIndex) => (
                        <div 
                          key={oIndex}
                          className={cn(
                            "p-2 rounded-md border text-sm",
                            option.isCorrect 
                              ? "border-quiz-correct bg-green-50 dark:bg-green-900/10" 
                              : oIndex === question.userAnswerIndex && !option.isCorrect
                                ? "border-quiz-incorrect bg-red-50 dark:bg-red-900/10"
                                : "border-gray-200 dark:border-gray-700"
                          )}
                        >
                          <div className="flex justify-between">
                            <span className={cn(oIndex === question.userAnswerIndex ? "font-semibold" : "")}>{option.text}</span>
                            {option.isCorrect && <Check className="text-quiz-correct h-4 w-4 flex-shrink-0" />}
                            {oIndex === question.userAnswerIndex && !option.isCorrect && <X className="text-quiz-incorrect h-4 w-4 flex-shrink-0" />}
                          </div>
                          {option.explanation && (
                            <div className="quiz-explanation mt-1 text-xs text-gray-600 dark:text-gray-400">
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
        <div className="mt-6 flex justify-center">
          <Button onClick={handleRetakeQuiz} className="quiz-btn quiz-btn-primary flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Retake Quiz
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizHistoryDetail;
