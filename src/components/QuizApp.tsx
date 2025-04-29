import React, { useEffect, useState } from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import QuizInput from './QuizInput';
import GeminiAI from './GeminiAI';
import QuizQuestion from './QuizQuestion';
import QuizResults from './QuizResults';
import QuizSettings from './QuizSettings';
import QuizHistory from './QuizHistory';
import ThemeToggle from './ThemeToggle';
import MobileNavToggle from './MobileNavToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, FileText, Sparkles, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const QuizApp = () => {
  const { quizStarted, quizFinished, questions } = useQuiz();
  const [showHistory, setShowHistory] = useState(false); // State for history view
  const [settingsOpen, setSettingsOpen] = useState(false); // State for settings dialog
  
  // Log the state to help debug
  useEffect(() => {
    console.log("Quiz state:", { quizStarted, quizFinished, questionsCount: questions.length });
  }, [quizStarted, quizFinished, questions]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 bg-gradient-to-br from-background to-secondary dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 relative">
      <div className="absolute top-6 right-6 hidden md:flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSettingsOpen(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
        <ThemeToggle />
      </div>
      
      <MobileNavToggle 
        onShowHistory={() => setShowHistory(true)} 
        showHistoryButton={!showHistory && !quizStarted && !quizFinished}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <Card className="w-full max-w-5xl shadow-xl overflow-hidden">
        <CardHeader className="text-center bg-muted/40 dark:bg-muted/20 border-b p-3 sm:p-4 md:p-6">
          <CardTitle className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-primary">
            MCQ Quiz Taker
          </CardTitle>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm md:text-base">
            Craft and conquer your custom quizzes!
          </p>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 md:p-8">          {showHistory ? (
            <QuizHistory onCloseHistory={() => setShowHistory(false)} />
          ) : (
            <>
              {!quizStarted && !quizFinished && (
                <div className="space-y-4 sm:space-y-6">
                  <Tabs defaultValue="manual" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
                      <TabsTrigger value="manual" className="flex items-center justify-center gap-1 sm:gap-2">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Manual Input</span>
                      </TabsTrigger>
                      <TabsTrigger value="ai" className="flex items-center justify-center gap-1 sm:gap-2">
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Gemini AI</span>
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="manual">
                      <QuizInput />
                    </TabsContent>
                    <TabsContent value="ai">
                      <GeminiAI />
                    </TabsContent>
                  </Tabs>
                  
                  {/* View History Button - only show on tablet/desktop */}
                  <div className="hidden md:flex justify-center pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowHistory(true)}
                      className="flex items-center gap-2"
                    >
                      <History className="h-4 w-4" />
                      View Quiz History
                    </Button>
                  </div>
                </div>
              )}

              {quizStarted && !quizFinished && questions.length > 0 && <QuizQuestion />}

              {quizFinished && <QuizResults />}
            </>
          )}
        </CardContent>
      </Card>      <footer className="mt-4 sm:mt-8 text-center text-xs sm:text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} MMM. All rights reserved.</p>
      </footer>      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-lg font-semibold">
              <Settings className="mr-2 h-5 w-5 text-primary" />
              Quiz Settings
            </DialogTitle>
          </DialogHeader>
          <QuizSettings asCard={false} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizApp;
