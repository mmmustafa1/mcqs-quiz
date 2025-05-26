import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Flashcard, FlashcardDeck, FlashcardStudySession, FlashcardSettings } from './FlashcardContext';

// Define the structure of a flashcard history entry
export interface FlashcardHistoryEntry {
  id: string;
  timestamp: number;
  deckTitle: string;
  totalCards: number;
  reviewedCards: number;
  correctCards: number;
  incorrectCards: number;
  skippedCards: number;
  accuracy: number; // percentage
  studyTime: number; // duration in seconds
  deck: FlashcardDeck; // Store the full deck to allow retaking
  session: FlashcardStudySession; // Store the session data
  settings: FlashcardSettings; // Store the settings used
}

// Define the shape of the context
interface FlashcardHistoryContextType {
  historyEntries: FlashcardHistoryEntry[];
  isHistoryEnabled: boolean;
  addHistoryEntry: (
    deck: FlashcardDeck,
    session: FlashcardStudySession,
    settings: FlashcardSettings
  ) => void;
  deleteHistoryEntry: (id: string) => void;
  toggleHistoryEnabled: () => void;
  clearHistory: () => void;
}

// Create the context with a default undefined value
const FlashcardHistoryContext = createContext<FlashcardHistoryContextType | undefined>(undefined);

// Define the props for the provider component
interface FlashcardHistoryProviderProps {
  children: ReactNode;
}

// Create the provider component
export const FlashcardHistoryProvider: React.FC<FlashcardHistoryProviderProps> = ({ children }) => {
  const [historyEntries, setHistoryEntries] = useState<FlashcardHistoryEntry[]>([]);
  const [isHistoryEnabled, setIsHistoryEnabled] = useState<boolean>(true); // Default to enabled

  // Load state from localStorage on initial mount
  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem('flashcardHistoryEntries');
      const storedEnabledStatus = localStorage.getItem('flashcardHistoryEnabled');

      if (storedEntries) {
        setHistoryEntries(JSON.parse(storedEntries));
      }
      if (storedEnabledStatus !== null) {
        setIsHistoryEnabled(JSON.parse(storedEnabledStatus));
      } else {
        // If no setting found, initialize it in localStorage
        localStorage.setItem('flashcardHistoryEnabled', JSON.stringify(true));
      }
    } catch (error) {
      console.error("Failed to load flashcard history from localStorage:", error);
      // Initialize defaults if loading fails
      localStorage.setItem('flashcardHistoryEntries', JSON.stringify([]));
      localStorage.setItem('flashcardHistoryEnabled', JSON.stringify(true));
    }
  }, []);

  // Save history entries to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('flashcardHistoryEntries', JSON.stringify(historyEntries));
    } catch (error) {
      console.error("Failed to save flashcard history entries to localStorage:", error);
    }
  }, [historyEntries]);

  // Save enabled status to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('flashcardHistoryEnabled', JSON.stringify(isHistoryEnabled));
    } catch (error) {
      console.error("Failed to save flashcard history enabled status to localStorage:", error);
    }
  }, [isHistoryEnabled]);

  // Function to add a new flashcard history entry
  const addHistoryEntry = (
    deck: FlashcardDeck,
    session: FlashcardStudySession,
    settings: FlashcardSettings
  ) => {
    if (!isHistoryEnabled || !session.isFinished) return;

    const studyTime = session.endTime && session.startTime 
      ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000)
      : 0;

    const accuracy = session.reviewedCards > 0 
      ? Math.round((session.correctCards / session.reviewedCards) * 100)
      : 0;

    const newEntry: FlashcardHistoryEntry = {
      id: `flashcard-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      deckTitle: deck.title,
      totalCards: deck.flashcards.length,
      reviewedCards: session.reviewedCards,
      correctCards: session.correctCards,
      incorrectCards: session.incorrectCards,
      skippedCards: session.skippedCards,
      accuracy,
      studyTime,
      deck,
      session,
      settings
    };

    // Add to the beginning of the array so newest appears first
    setHistoryEntries(prevEntries => {
      // Check for potential duplicates based on deck ID and timestamp proximity (within 5 seconds)
      const isDuplicate = prevEntries.some(entry => 
        entry.deck.id === deck.id && 
        Math.abs(entry.timestamp - newEntry.timestamp) < 5000
      );

      if (isDuplicate) {
        console.log("Potential duplicate flashcard history entry detected, skipping");
        return prevEntries;
      }

      return [newEntry, ...prevEntries];
    });
  };

  // Function to delete a history entry
  const deleteHistoryEntry = (id: string) => {
    setHistoryEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
  };

  // Function to toggle history enabled status
  const toggleHistoryEnabled = () => {
    setIsHistoryEnabled(prev => !prev);
  };

  // Function to clear all history
  const clearHistory = () => {
    setHistoryEntries([]);
  };

  // Provide the context value
  const contextValue: FlashcardHistoryContextType = {
    historyEntries,
    isHistoryEnabled,
    addHistoryEntry,
    deleteHistoryEntry,
    toggleHistoryEnabled,
    clearHistory
  };

  return (
    <FlashcardHistoryContext.Provider value={contextValue}>
      {children}
    </FlashcardHistoryContext.Provider>
  );
};

// Custom hook to use the flashcard history context
export const useFlashcardHistory = (): FlashcardHistoryContextType => {
  const context = useContext(FlashcardHistoryContext);
  if (context === undefined) {
    throw new Error('useFlashcardHistory must be used within a FlashcardHistoryProvider');
  }
  return context;
};

export default FlashcardHistoryContext;
