import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { QuizQuestion, QuizSettings } from './QuizContext'; // Import necessary types

// Define the structure of a history entry
export interface HistoryEntry {
  id: string;
  timestamp: number;
  score: number; // Calculated correct answers
  totalQuestions: number;
  questions: QuizQuestion[]; // Store the actual questions with user answers
  settings: QuizSettings; // Store the settings used for this quiz
}

// Define the shape of the context
interface HistoryContextType {
  historyEntries: HistoryEntry[];
  isHistoryEnabled: boolean;
  addHistoryEntry: (
    score: number, 
    totalQuestions: number, 
    questions: QuizQuestion[], 
    settings: QuizSettings
  ) => void; // Update signature
  deleteHistoryEntry: (id: string) => void;
  toggleHistoryEnabled: () => void;
}

// Create the context with a default undefined value
const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

// Define the props for the provider component
interface HistoryProviderProps {
  children: ReactNode;
}

// Create the provider component
export const HistoryProvider: React.FC<HistoryProviderProps> = ({ children }) => {
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [isHistoryEnabled, setIsHistoryEnabled] = useState<boolean>(true); // Default to enabled

  // Load state from localStorage on initial mount
  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem('quizHistoryEntries');
      const storedEnabledStatus = localStorage.getItem('quizHistoryEnabled');

      if (storedEntries) {
        setHistoryEntries(JSON.parse(storedEntries));
      }
      if (storedEnabledStatus !== null) {
        setIsHistoryEnabled(JSON.parse(storedEnabledStatus));
      } else {
        // If no setting found, initialize it in localStorage
         localStorage.setItem('quizHistoryEnabled', JSON.stringify(true));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage:", error);
      // Initialize defaults if loading fails
      localStorage.setItem('quizHistoryEntries', JSON.stringify([]));
      localStorage.setItem('quizHistoryEnabled', JSON.stringify(true));
    }
  }, []);

  // Save history entries to localStorage whenever they change
  useEffect(() => {
     try {
        localStorage.setItem('quizHistoryEntries', JSON.stringify(historyEntries));
     } catch (error) {
        console.error("Failed to save history entries to localStorage:", error);
     }
  }, [historyEntries]);

  // Save enabled status to localStorage whenever it changes
  useEffect(() => {
    try {
        localStorage.setItem('quizHistoryEnabled', JSON.stringify(isHistoryEnabled));
    } catch (error) {
        console.error("Failed to save history enabled status to localStorage:", error);
    }
  }, [isHistoryEnabled]);
  // Function to add a new history entry
  const addHistoryEntry = (
    score: number, 
    totalQuestions: number, 
    questions: QuizQuestion[], 
    settings: QuizSettings
  ) => {
    if (!isHistoryEnabled) return; // Only add if history is enabled

    const newEntry: HistoryEntry = {
      id: `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // More robust ID
      timestamp: Date.now(),
      score,
      totalQuestions,
      questions, // Store questions
      settings, // Store settings
    };

    // Add to the beginning of the array so newest appears first
    setHistoryEntries(prevEntries => {
      // Check if this might be a duplicate entry (for Gemini AI quizzes that were added at start)
      // We consider it a duplicate if the total questions and questions content is the same
      // and it was added within the last minute (temporary entry from starting quiz)
      const possibleDuplicate = prevEntries.find(entry => {
        // If total questions don't match, not a duplicate
        if (entry.totalQuestions !== totalQuestions) return false;
        
        // If the timestamp is more than 5 minutes old, not a "just started" duplicate
        if (Date.now() - entry.timestamp > 5 * 60 * 1000) return false;
        
        // If the score is not 0, then it's a completed quiz, not a "just started" one
        if (entry.score !== 0) return false;

        // Deep check if questions array has the same content
        return entry.questions.length === questions.length;
      });

      if (possibleDuplicate) {
        // Replace the existing entry with the updated one (with real score)
        return prevEntries.map(entry => 
          entry.id === possibleDuplicate.id ? newEntry : entry
        );
      }
      
      // Otherwise add as a new entry
      return [newEntry, ...prevEntries];
    });
  };

  // Function to delete a history entry by ID
  const deleteHistoryEntry = (id: string) => {
    setHistoryEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
  };

  // Function to toggle the history feature enabled status
  const toggleHistoryEnabled = () => {
    setIsHistoryEnabled(prevEnabled => !prevEnabled);
  };

  // Provide the state and functions through the context
  const value = {
    historyEntries,
    isHistoryEnabled,
    addHistoryEntry,
    deleteHistoryEntry,
    toggleHistoryEnabled,
  };

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
};

// Custom hook to use the HistoryContext
export const useHistory = (): HistoryContextType => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
