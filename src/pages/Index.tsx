
import React from 'react';
import { QuizProvider } from '@/contexts/QuizContext';
import { FlashcardProvider } from '@/contexts/FlashcardContext';
import QuizApp from '@/components/QuizApp';

const Index = () => {
  return (
    <QuizProvider>
      <FlashcardProvider>
        <QuizApp />
      </FlashcardProvider>
    </QuizProvider>
  );
};

export default Index;
