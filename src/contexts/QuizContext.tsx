import React, { createContext, useContext, useState, ReactNode } from 'react';

interface QuizData {
  questions: {
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
  title?: string;
}

export interface QuizOption {
  text: string;
  explanation?: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
  userAnswerIndex?: number;
}

// Export QuizSettings interface
export interface QuizSettings {
  immediateFeedback: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
}

interface QuizContextType {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  settings: QuizSettings;
  quizStarted: boolean;
  quizFinished: boolean;
  quizTitle: string;
  parseQuestions: (text: string, title?: string) => void;
  loadQuiz: (quizData: QuizData) => void;
  startQuiz: () => void;
  submitAnswer: (optionIndex: number) => void;
  nextQuestion: () => void;
  restartQuiz: () => void;
  finishQuiz: () => void;
  goToHome: () => void;
  updateSettings: (newSettings: Partial<QuizSettings>) => void;
  setQuizTitle: (title: string) => void;
  startQuizWithData: (questions: QuizQuestion[], settings: QuizSettings, title?: string) => void; // Add function for retakes
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

interface QuizProviderProps {
  children: ReactNode;
}

export const QuizProvider = ({ children }: QuizProviderProps) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizTitle, setQuizTitle] = useState<string>("");
  const [settings, setSettings] = useState<QuizSettings>({
    immediateFeedback: true,
    shuffleQuestions: false,
    shuffleOptions: false,
  });

  // Placeholder for loadQuiz - implement if needed for loading from JSON etc.
  const loadQuiz = (quizData: QuizData) => {
    console.warn("loadQuiz function is not fully implemented.", quizData);
    // Basic implementation:
    const loadedQuestions = quizData.questions.map(q => ({
      question: q.question,
      options: q.options.map((opt, index) => ({
        text: opt,
        isCorrect: q.correctAnswer === opt, // Assuming correctAnswer is the text
        explanation: '' // Add logic if explanations are in QuizData
      }))
    }));
    setQuestions(loadedQuestions);
    setQuizTitle(quizData.title || "");
    setCurrentQuestionIndex(0);
    setQuizFinished(false);
    setQuizStarted(false); // Reset started state
  };

  const parseQuestions = (text: string, title?: string) => { // Add optional title
    if (!text.trim()) {
      setQuestions([]);
      return;
    }

    const lines = text.split('\n');
    const parsedQuestions: QuizQuestion[] = [];
    let currentQuestion: QuizQuestion | null = null;
    let currentOption: QuizOption | null = null;

    // Enhanced: Detect question lines with or without numbering
    const isQuestionLine = (line: string) => {
      // Support Q:, Q1:, Q2:, 1., 2., etc. and also unnumbered questions
      return (
        line.startsWith('Q:') ||
        /^Q\d+:/.test(line) ||
        /^\d+\./.test(line) ||
        (
          line.length > 0 &&
          !line.match(/^[A-Z]\)/i) &&
          !line.startsWith('Explanation:')
        )
      );
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (isQuestionLine(line)) {
        // Before starting a new question, push the last option if it exists
        if (currentOption && currentQuestion) {
          currentQuestion.options.push(currentOption);
          currentOption = null;
        }
        // Start new question
        if (currentQuestion) {
          if (currentQuestion.options.length > 0) {
            parsedQuestions.push(currentQuestion);
          }
        }
        // Remove 'Q:', 'Q1:', or number prefix to get the actual question
        let questionText = line;
        if (line.startsWith('Q:')) {
          questionText = line.substring(2).trim();
        } else if (/^Q\d+:/.test(line)) {
          questionText = line.replace(/^Q\d+:/, '').trim();
        } else if (/^\d+\./.test(line)) {
          questionText = line.replace(/^\d+\./, '').trim();
        }
        currentQuestion = {
          question: questionText,
          options: []
        };
        currentOption = null;
      } 
      else if (line.match(/^[A-Z]\)/i) && currentQuestion) {
        // Before starting a new option, push the last option if it exists
        if (currentOption) {
          currentQuestion.options.push(currentOption);
        }
        const optionText = line.substring(2).trim();
        const isCorrect = optionText.endsWith('*');
        currentOption = {
          text: isCorrect ? optionText.slice(0, -1).trim() : optionText,
          isCorrect,
          explanation: ''
        };
      } 
      else if (line.startsWith('Explanation:') && currentOption) {
        // Add explanation to current option
        currentOption.explanation = line.substring('Explanation:'.length).trim();
      } 
      else if (line.trim() && currentOption && currentQuestion) {
        // If there's content and we're already processing an option, it's likely an explanation
        if (!currentOption.explanation) {
          currentOption.explanation = line.trim();
        } else {
          currentOption.explanation += ' ' + line.trim();
        }
      } 
      else if (line === '' && currentOption && currentQuestion) {
        // End of an option
        currentQuestion.options.push(currentOption);
        currentOption = null;
      }
    }

    // Add the last option if it exists
    if (currentOption && currentQuestion) {
      currentQuestion.options.push(currentOption);
    }
    // Add the last question if it exists
    if (currentQuestion && currentQuestion.options.length > 0) {
      parsedQuestions.push(currentQuestion);
    }

    setQuestions(parsedQuestions);
    setQuizTitle(title || ""); // Set title if provided
    // Reset to initial state
    setCurrentQuestionIndex(0);
    setQuizFinished(false);
    setQuizStarted(false); // Reset started state
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const startQuiz = () => {
    if (questions.length === 0) {
      console.error("Cannot start quiz: No questions available");
      return;
    }
    
    let processedQuestions = [...questions];
    
    // Apply shuffling if needed
    if (settings.shuffleQuestions) {
      processedQuestions = shuffleArray(processedQuestions);
    }
    
    if (settings.shuffleOptions) {
      processedQuestions = processedQuestions.map(q => {
        // Find the correct answer index before shuffling
        const correctIndex = q.options.findIndex(opt => opt.isCorrect);
        
        // Shuffle options
        const shuffledOptions = shuffleArray(q.options);
        
        // Return question with shuffled options
        return {
          ...q,
          options: shuffledOptions
        };
      });
    }
    
    setQuestions(processedQuestions);
    setCurrentQuestionIndex(0);
    setQuizStarted(true);
    setQuizFinished(false);
  };

  const submitAnswer = (optionIndex: number) => {
    if (currentQuestionIndex >= questions.length) {
      console.error("Cannot submit answer: Invalid question index");
      return;
    }
    
    setQuestions(prevQuestions => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[currentQuestionIndex] = {
        ...updatedQuestions[currentQuestionIndex],
        userAnswerIndex: optionIndex
      };
      return updatedQuestions;
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const restartQuiz = () => {
    if (questions.length === 0) {
      console.error("Cannot restart quiz: No questions available");
      return;
    }
    // Reset quiz finished state
    setQuizFinished(false);
    // Instead of just resetting answers, re-run startQuiz to apply shuffling
    startQuiz();
  };

  const finishQuiz = () => {
    setQuizFinished(true);
    // Don't set quizStarted to false here to avoid UI conflicts
  };

  const goToHome = () => {
    setQuizStarted(false);
    setQuizFinished(false);
  };

  const updateSettings = (newSettings: Partial<QuizSettings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  };

  const setQuizTitleHandler = (title: string) => {
    setQuizTitle(title);
  };

  // Function to start a quiz with specific data (for retakes)
  const startQuizWithData = (
    initialQuestions: QuizQuestion[], 
    initialSettings: QuizSettings, 
    title: string = ""
  ) => {
    // Reset user answers before starting
    const questionsWithoutAnswers = initialQuestions.map(q => ({
      ...q,
      userAnswerIndex: undefined 
    }));

    setQuestions(questionsWithoutAnswers);
    setSettings(initialSettings);
    setQuizTitle(title);
    setCurrentQuestionIndex(0);
    setQuizStarted(true);
    setQuizFinished(false);
    // Note: We might skip shuffling here if we want the retake to be identical
    // Or apply shuffling based on initialSettings if desired
  };


  const value: QuizContextType = {
    questions,
    currentQuestionIndex,
    settings,
    quizStarted,
    quizFinished,
    quizTitle, // Add quizTitle
    loadQuiz, // Add loadQuiz
    parseQuestions,
    startQuiz,
    startQuizWithData, // Add startQuizWithData
    submitAnswer,
    nextQuestion,
    restartQuiz,
    finishQuiz,
    goToHome,
    updateSettings,
    setQuizTitle: setQuizTitleHandler // Add setQuizTitle
  };

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
};
