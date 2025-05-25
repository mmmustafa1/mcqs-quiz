import React, { useState } from 'react';
import { HistoryEntry, useHistory } from '@/contexts/HistoryContext';
import QuizHistoryDetail from './QuizHistoryDetail';
import { Button } from '@/components/ui/button';
import { Trash2, X, Info, BarChart3 } from 'lucide-react';
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
  };  if (!isHistoryEnabled) {
    return (
      <div className="quiz-card animate-fade-in">
        <div className="flex flex-row items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg flex items-center justify-center transform rotate-3">
                <div className="text-white text-sm font-bold">H</div>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-md shadow-md flex items-center justify-center transform -rotate-12">
                <div className="text-white text-xs font-bold">�</div>
              </div>
            </div>
            Quiz History
          </h2>
          <Button variant="ghost" size="icon" onClick={onCloseHistory} aria-label="Close history view">
            <X className="h-5 w-5" />
          </Button>
        </div><div className="card-enhanced p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-300/20 to-gray-500/20 rounded-xl"></div>
              <div className="relative z-10 flex items-center justify-center">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <div className="text-white text-lg font-bold">🔒</div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Quiz history recording is currently disabled. You can enable it in the settings.
          </p>
        </div>
      </div>
    );
  }
  if (historyEntries.length === 0) {
    return (
      <div className="quiz-card animate-fade-in">
        <div className="flex flex-row items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg flex items-center justify-center transform rotate-3">
                <div className="text-white text-sm font-bold">H</div>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-md shadow-md flex items-center justify-center transform -rotate-12">
                <div className="text-white text-xs font-bold">�</div>
              </div>
            </div>
            Quiz History
          </h2>
          <Button variant="ghost" size="icon" onClick={onCloseHistory} aria-label="Close history view">
            <X className="h-5 w-5" />
          </Button>
        </div><div className="card-enhanced p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-xl"></div>
              <div className="relative z-10 flex items-center justify-center">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <div className="text-white text-lg font-bold">📝</div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
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
  }  // Otherwise, show the history list view
  return (
    <div className="quiz-card animate-fade-in">
      <div className="flex flex-row items-center justify-between mb-6">
        <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Quiz History
        </h2>
        <Button variant="ghost" size="icon" onClick={onCloseHistory} aria-label="Close history view">
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="space-y-4 max-h-[60vh] sm:max-h-[400px] overflow-y-auto">
        {historyEntries.map((entry) => {
          const score = ((entry.score / entry.totalQuestions) * 100).toFixed(1);
          const scoreNum = parseFloat(score);
          
          return (
            <div 
              key={entry.id} 
              className="card-enhanced p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => setSelectedEntryId(entry.id)}
            >
              {/* Mobile Layout */}
              <div className="sm:hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex items-center justify-center h-12 w-12 rounded-full text-white text-sm font-bold shadow-lg",
                      scoreNum >= 90 ? "bg-gradient-to-r from-green-500 to-emerald-600" :
                      scoreNum >= 70 ? "bg-gradient-to-r from-blue-500 to-green-500" :
                      scoreNum >= 50 ? "bg-gradient-to-r from-yellow-500 to-orange-500" :
                      "bg-gradient-to-r from-red-500 to-pink-500"
                    )}>
                      {Math.round(scoreNum)}%
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {entry.score}/{entry.totalQuestions} Correct
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEntryId(entry.id);
                      }}
                      aria-label="View details"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 h-8 w-8"
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
                      aria-label="Delete entry"
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>                {/* Enhanced Progress bar for mobile */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "progress-fill",
                      scoreNum >= 90 ? "score-excellent" :
                      scoreNum >= 70 ? "score-good" :
                      scoreNum >= 50 ? "score-average" :
                      "score-poor"
                    )}
                    style={{
                      '--progress-width': `${score}%`
                    } as React.CSSProperties}
                  ></div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex items-center justify-center h-14 w-14 rounded-full text-white text-lg font-bold shadow-lg",
                    scoreNum >= 90 ? "bg-gradient-to-r from-green-500 to-emerald-600" :
                    scoreNum >= 70 ? "bg-gradient-to-r from-blue-500 to-green-500" :
                    scoreNum >= 50 ? "bg-gradient-to-r from-yellow-500 to-orange-500" :
                    "bg-gradient-to-r from-red-500 to-pink-500"
                  )}>
                    {Math.round(scoreNum)}%
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                      {entry.score}/{entry.totalQuestions} Questions Correct
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Taken on: {formatTimestamp(entry.timestamp)}
                    </p>                    <div className="mt-2 w-48 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "progress-fill",
                          scoreNum >= 90 ? "score-excellent" :
                          scoreNum >= 70 ? "score-good" :
                          scoreNum >= 50 ? "score-average" :
                          "score-poor"
                        )}
                        style={{
                          '--progress-width': `${score}%`
                        } as React.CSSProperties}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEntryId(entry.id);
                    }}
                    aria-label={`View details for quiz from ${formatTimestamp(entry.timestamp)}`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 h-10 w-10 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20"
                  >
                    <Info className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteHistoryEntry(entry.id);
                    }}
                    aria-label={`Delete history entry from ${formatTimestamp(entry.timestamp)}`}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-10 w-10 group-hover:bg-red-50 dark:group-hover:bg-red-900/20"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizHistory;
