import React, { createContext, useState, useEffect, ReactNode } from 'react';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags?: string[];
  created_at?: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  description?: string;
  flashcards: Flashcard[];
  created_at: string;
  source: 'document' | 'prompt';
  metadata?: {
    total_count: number;
    generated_at: string;
  };
}

export interface FlashcardStudySession {
  deckId: string;
  currentCardIndex: number;
  reviewedCards: number;
  correctCards: number;
  incorrectCards: number;
  skippedCards: number;
  startTime: Date;
  endTime?: Date;
  isFinished: boolean;
  cardResults: Array<{
    cardId: string;
    cardFront: string;
    cardBack: string;
    result: 'correct' | 'incorrect' | 'skipped';
    timeSpent?: number;
  }>;
}

export interface FlashcardSettings {
  shuffleCards: boolean;
  showProgress: boolean;
  autoFlip: boolean;
  autoFlipDelay: number; // seconds
  studyMode: 'sequential' | 'random' | 'spaced-repetition';
  difficultyFilter: 'all' | 'easy' | 'medium' | 'hard';
}

interface FlashcardContextType {
  // Current deck and cards
  currentDeck: FlashcardDeck | null;
  currentCard: Flashcard | null;
  currentCardIndex: number;
  
  // Study session
  studySession: FlashcardStudySession | null;
  isStudying: boolean;
  showAnswer: boolean;
  
  // Settings
  settings: FlashcardSettings;
  // Actions
  loadDeck: (deck: FlashcardDeck) => void;
  clearDeck: () => void;
  startStudySession: () => void;
  endStudySession: () => void;
  nextCard: (isAutoAdvance?: boolean) => void;
  previousCard: () => void;
  toggleAnswer: () => void;
  markCard: (correct: boolean) => void;
  shuffleDeck: () => void;
  resetSession: () => void;
  updateSettings: (newSettings: Partial<FlashcardSettings>) => void;
  
  // Generation
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  addGeneratedDeck: (deck: FlashcardDeck) => void;
}

export const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

interface FlashcardProviderProps {
  children: ReactNode;
}

export const FlashcardProvider = ({ children }: FlashcardProviderProps) => {
  const [currentDeck, setCurrentDeck] = useState<FlashcardDeck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [studySession, setStudySession] = useState<FlashcardStudySession | null>(null);
  const [isStudying, setIsStudying] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize settings from localStorage
  const [settings, setSettings] = useState<FlashcardSettings>(() => {
    try {
      const savedSettings = localStorage.getItem('flashcardSettings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error("Failed to load flashcard settings from localStorage:", error);
    }
    // Default settings
    return {
      shuffleCards: false,
      showProgress: true,
      autoFlip: false,
      autoFlipDelay: 3,
      studyMode: 'sequential',
      difficultyFilter: 'all',
    };
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('flashcardSettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save flashcard settings to localStorage:", error);
    }
  }, [settings]);

  // Get current card
  const currentCard = currentDeck && currentDeck.flashcards[currentCardIndex] 
    ? currentDeck.flashcards[currentCardIndex] 
    : null;
  const loadDeck = (deck: FlashcardDeck) => {
    setCurrentDeck(deck);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setIsStudying(false);
    setStudySession(null);
  };

  const clearDeck = () => {
    setCurrentDeck(null);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setIsStudying(false);
    setStudySession(null);
  };
  const startStudySession = () => {
    if (!currentDeck) return;

    const session: FlashcardStudySession = {
      deckId: currentDeck.id,
      currentCardIndex: 0,
      reviewedCards: 0,
      correctCards: 0,
      incorrectCards: 0,
      skippedCards: 0,
      startTime: new Date(),
      isFinished: false,
      cardResults: [],
    };

    setStudySession(session);
    setIsStudying(true);
    setCurrentCardIndex(0);
    setShowAnswer(false);

    // Apply settings
    if (settings.shuffleCards) {
      shuffleDeck();
    }
  };const endStudySession = () => {
    if (studySession) {
      const updatedSession = {
        ...studySession,
        endTime: new Date(),
        isFinished: true,
      };
      setStudySession(updatedSession);
    }
    setIsStudying(false);
  };  const nextCard = (isAutoAdvance = false) => {
    if (!currentDeck || !studySession || !currentCard) return;

    // Only record as skipped if it's a manual next click (not auto-advance) and answer is showing and card not marked
    const cardAlreadyMarked = studySession.cardResults.find(result => result.cardId === currentCard.id);
    
    if (!isAutoAdvance && showAnswer && !cardAlreadyMarked) {
      const cardResult = {
        cardId: currentCard.id,
        cardFront: currentCard.front,
        cardBack: currentCard.back,
        result: 'skipped' as const,
      };

      const updatedSession = {
        ...studySession,
        reviewedCards: studySession.reviewedCards + 1,
        skippedCards: studySession.skippedCards + 1,
        cardResults: [...studySession.cardResults, cardResult],
      };

      setStudySession(updatedSession);
      console.log('Card skipped:', { cardId: currentCard.id, updatedSession });
    }

    const nextIndex = currentCardIndex + 1;
    if (nextIndex >= currentDeck.flashcards.length) {
      // End of deck
      endStudySession();
      return;
    }

    setCurrentCardIndex(nextIndex);
    setShowAnswer(false);
    
    // Update session
    setStudySession(prev => prev ? {
      ...prev,
      currentCardIndex: nextIndex,
    } : prev);
  };

  const previousCard = () => {
    if (!currentDeck || currentCardIndex === 0) return;

    const prevIndex = currentCardIndex - 1;
    setCurrentCardIndex(prevIndex);
    setShowAnswer(false);

    if (studySession) {
      setStudySession({
        ...studySession,
        currentCardIndex: prevIndex,
      });
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };  const markCard = (correct: boolean) => {
    if (!studySession || !currentDeck || !currentCard) return;

    const cardResult = {
      cardId: currentCard.id,
      cardFront: currentCard.front,
      cardBack: currentCard.back,
      result: correct ? 'correct' as const : 'incorrect' as const,
    };

    const updatedSession = {
      ...studySession,
      reviewedCards: studySession.reviewedCards + 1,
      correctCards: correct ? studySession.correctCards + 1 : studySession.correctCards,
      incorrectCards: correct ? studySession.incorrectCards : studySession.incorrectCards + 1,
      cardResults: [...studySession.cardResults, cardResult],
    };    console.log('Marking card:', { 
      correct, 
      cardId: currentCard.id, 
      currentStats: {
        reviewed: studySession.reviewedCards,
        correct: studySession.correctCards,
        incorrect: studySession.incorrectCards,
        skipped: studySession.skippedCards
      },
      updatedStats: {
        reviewed: updatedSession.reviewedCards,
        correct: updatedSession.correctCards,
        incorrect: updatedSession.incorrectCards,
        skipped: updatedSession.skippedCards
      }
    });
    setStudySession(updatedSession);
    
    // Check if this was the last card
    const nextIndex = currentCardIndex + 1;
    if (nextIndex >= currentDeck.flashcards.length) {
      // This was the last card - end the session with the updated stats
      console.log('Last card marked, ending session with stats:', updatedSession);
      setTimeout(() => {
        const finalSession = {
          ...updatedSession,
          endTime: new Date(),
          isFinished: true,
        };
        console.log('Setting final session:', finalSession);
        setStudySession(finalSession);
        setIsStudying(false);
      }, 500);      } else {
        // Auto-advance to next card after marking (using isAutoAdvance = true)
        setTimeout(() => {
          nextCard(true);
        }, 500);
      }
  };

  const shuffleDeck = () => {
    if (!currentDeck) return;

    const shuffledCards = [...currentDeck.flashcards];
    for (let i = shuffledCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
    }

    setCurrentDeck({
      ...currentDeck,
      flashcards: shuffledCards,
    });
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  const resetSession = () => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setStudySession(null);
    setIsStudying(false);
  };

  const updateSettings = (newSettings: Partial<FlashcardSettings>) => {
    setSettings({ ...settings, ...newSettings });
  };

  const addGeneratedDeck = (deck: FlashcardDeck) => {
    setCurrentDeck(deck);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setIsStudying(false);
    setStudySession(null);
  };

  return (    <FlashcardContext.Provider
      value={{
        currentDeck,
        currentCard,
        currentCardIndex,
        studySession,
        isStudying,
        showAnswer,
        settings,
        loadDeck,
        clearDeck,
        startStudySession,
        endStudySession,
        nextCard,
        previousCard,
        toggleAnswer,
        markCard,
        shuffleDeck,
        resetSession,
        updateSettings,
        isGenerating,
        setIsGenerating,
        addGeneratedDeck,
      }}
    >
      {children}    </FlashcardContext.Provider>
  );
};
