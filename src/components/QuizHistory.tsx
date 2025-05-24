import React, { useState } from 'react';
import { HistoryEntry, useHistory } from '@/contexts/HistoryContext';
import QuizHistoryDetail from './QuizHistoryDetail';
import { Button } from '@/components/ui/button';
import { Trash2, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizHistoryProps {
  onCloseHistory: () => void; // Function to close the history view entirely
}

const QuizHistory: React.FC<QuizHistoryProps> = ({ onCloseHistory }) => {
  const { historyEntries, deleteHistoryEntry, isHistoryEnabled } = useHistory();
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null); // State for detail view

  // Find the selected entry
  const selectedEntry = historyEntries.find(entry => entry.id === selectedEntryId);

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString(); // Adjust formatting as needed
  };
  if (!isHistoryEnabled) {
    return (
      <div className="quiz-card animate-fade-in">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Quiz History</h2>
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            Quiz history recording is currently disabled. You can enable it in the settings.
          </p>
        </div>
      </div>
    );
  }

  if (historyEntries.length === 0) {
    return (
      <div className="quiz-card animate-fade-in">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Quiz History</h2>
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            No quiz history recorded yet. Complete a quiz to see your results here.
          </p>
        </div>
      </div>
    );
  }

  // If an entry is selected, show the detail view
  if (selectedEntry) {
    return (
      <QuizHistoryDetail 
        entry={selectedEntry} 
        onBack={() => setSelectedEntryId(null)} // Function to go back to list
        onCloseHistory={onCloseHistory} // Pass down the main close function
      />
    );
  }
  // Otherwise, show the history list view
  return (
    <div className="quiz-card animate-fade-in">
      <div className="flex flex-row items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">Quiz History</h2>
        <Button variant="ghost" size="icon" onClick={onCloseHistory} aria-label="Close history view">
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="space-y-3 sm:space-y-4 max-h-[400px] overflow-y-auto scrollbar-webkit">
        {historyEntries.map((entry) => {
          const score = ((entry.score / entry.totalQuestions) * 100).toFixed(1);
          const scoreNum = parseFloat(score);
          
          return (
            <div 
              key={entry.id} 
              className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() => setSelectedEntryId(entry.id)}
            >
              <div className="flex-grow">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className={cn(
                    "flex items-center justify-center h-6 w-6 sm:h-7 sm:w-7 rounded-full text-white text-xs sm:text-sm font-bold",
                    scoreNum >= 70 ? "bg-quiz-correct" : "bg-quiz-incorrect"
                  )}>
                    {score}%
                  </div>
                  <p className="font-medium text-sm sm:text-base">
                    {entry.score}/{entry.totalQuestions} Questions Correct
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Taken on: {formatTimestamp(entry.timestamp)}
                </p>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2 ml-3 sm:ml-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEntryId(entry.id);
                  }}
                  aria-label={`View details for quiz from ${formatTimestamp(entry.timestamp)}`}
                  className="text-quiz-primary hover:text-quiz-secondary h-8 w-8 sm:h-9 sm:w-9"
                >
                  <Info className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteHistoryEntry(entry.id);
                  }}
                  aria-label={`Delete history entry from ${formatTimestamp(entry.timestamp)}`}
                  className="text-red-500 hover:text-red-700 h-8 w-8 sm:h-9 sm:w-9"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizHistory;
