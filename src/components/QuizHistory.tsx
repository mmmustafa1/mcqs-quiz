import React, { useState } from 'react'; // Import useState
import { HistoryEntry, useHistory } from '@/contexts/HistoryContext'; // Import HistoryEntry
import QuizHistoryDetail from './QuizHistoryDetail'; // Import the detail component
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, X, Info } from 'lucide-react'; // Import icons

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
      <Card className="quiz-card animate-fade-in">
        <CardHeader>
          <CardTitle>Quiz History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 dark:text-gray-400">
            Quiz history recording is currently disabled. You can enable it in the settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (historyEntries.length === 0) {
    return (
      <Card className="quiz-card animate-fade-in">
        <CardHeader>
          <CardTitle>Quiz History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 dark:text-gray-400">
            No quiz history recorded yet. Complete a quiz to see your results here.
          </p>
        </CardContent>
      </Card>
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
    <Card className="quiz-card animate-fade-in w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Quiz History</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCloseHistory} aria-label="Close history view">
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4"> {/* Adjust height as needed */}
          <div className="space-y-4">
            {historyEntries.map((entry) => (
              <div 
                key={entry.id} 
                className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-grow cursor-pointer" onClick={() => setSelectedEntryId(entry.id)}>
                  <p className="font-medium">
                    Score: {entry.score}/{entry.totalQuestions} ({((entry.score / entry.totalQuestions) * 100).toFixed(1)}%)
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Taken on: {formatTimestamp(entry.timestamp)}
                  </p>
                </div>
                <div className="flex items-center ml-4">
                   <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedEntryId(entry.id)} // Also allow clicking icon to view details
                    aria-label={`View details for quiz from ${formatTimestamp(entry.timestamp)}`}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Info className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the detail view click
                      deleteHistoryEntry(entry.id);
                    }}
                    aria-label={`Delete history entry from ${formatTimestamp(entry.timestamp)}`}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      {/* Optional Footer */}
      {/* <CardFooter> 
        <Button variant="destructive" className="w-full">Clear All History</Button>
      </CardFooter> */}
    </Card>
  );
};

export default QuizHistory;
