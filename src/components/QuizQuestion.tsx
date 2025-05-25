
import React, { useState } from 'react';
import { useQuiz, QuizOption } from '@/contexts/QuizContext';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const QuizQuestion = () => {
  const { 
    questions, 
    currentQuestionIndex, 
    submitAnswer, 
    nextQuestion,
    finishQuiz,
    settings 
  } = useQuiz();
  
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  
  // Check if we have questions and if the current index is valid
  if (!questions.length || currentQuestionIndex >= questions.length) {
    return (
      <div className="quiz-card animate-fade-in">
        <h2 className="text-xl font-bold mb-6">No questions available</h2>
        <p>Please add questions to start the quiz.</p>
      </div>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  const handleOptionSelect = (index: number) => {
    if (answered) return;
    setSelectedOption(index);
  };
  
  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    
    submitAnswer(selectedOption);
    setAnswered(true);
    
    if (!settings.immediateFeedback) {
      handleNext();
    }
  };
  
  const handleNext = () => {
    setSelectedOption(null);
    setAnswered(false);
    
    if (isLastQuestion) {
      finishQuiz();
    } else {
      nextQuestion();
    }
  };
  
  const getOptionClassName = (option: QuizOption, index: number) => {
    let className = "quiz-option";
    
    if (index === selectedOption) {
      className += " selected";
    }
    
    if (answered && settings.immediateFeedback) {
      if (option.isCorrect) {
        className += " correct";
      } else if (index === selectedOption && !option.isCorrect) {
        className += " incorrect";
      }
    }
    
    return className;
  };

  return (
    <div className="quiz-card animate-fade-in relative">
      {/* Enhanced Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm font-bold text-primary">
            {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
          </span>
        </div>
        <div className="quiz-progress h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`
            }}
          ></div>
        </div>
      </div>
      
      {/* Question */}
      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 leading-relaxed text-gray-900 dark:text-gray-100">
          {currentQuestion.question}
        </h2>
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        {currentQuestion.options.map((option, index) => (
          <div
            key={index}
            className={getOptionClassName(option, index)}
            onClick={() => handleOptionSelect(index)}
          >
            <div className="flex items-center gap-2 sm:gap-3 w-full">
              <div className={cn(
                "flex-shrink-0 flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full border",
                selectedOption === index ? "border-quiz-primary bg-quiz-primary/10" : "border-gray-300 dark:border-gray-600"
              )}>
                {selectedOption === index && <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-quiz-primary"></div>}
              </div>
              
              <div className="flex-grow font-medium text-sm sm:text-base">
                {option.text}
              </div>
              
              {answered && settings.immediateFeedback && (
                <div className="flex-shrink-0">
                  {option.isCorrect ? (
                    <Check className="text-quiz-correct h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (index === selectedOption && <X className="text-quiz-incorrect h-4 w-4 sm:h-5 sm:w-5" />)}
                </div>
              )}
            </div>
            
            {answered && settings.immediateFeedback && option.explanation && (
              <div className="quiz-explanation text-xs sm:text-sm mt-1 ml-7 sm:ml-9">
                {option.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 sm:mt-8 flex justify-between">
        {!answered ? (
          <Button
            onClick={handleSubmitAnswer}
            disabled={selectedOption === null}
            className="ml-auto quiz-btn quiz-btn-primary text-sm sm:text-base"
          >
            Submit Answer
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="ml-auto quiz-btn quiz-btn-primary text-sm sm:text-base"
          >
            {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizQuestion;
