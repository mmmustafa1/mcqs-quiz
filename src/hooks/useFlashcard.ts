import { useContext } from 'react';
import { FlashcardContext } from '../contexts/FlashcardContext';

export const useFlashcard = () => {
  const context = useContext(FlashcardContext);
  if (!context) {
    throw new Error('useFlashcard must be used within a FlashcardProvider');
  }
  return context;
};
