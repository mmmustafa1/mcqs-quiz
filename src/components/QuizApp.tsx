import React, { useEffect, useState } from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import QuizInput from './QuizInput';
import GeminiAI from './GeminiAI';
import QuizQuestion from './QuizQuestion';
import QuizResults from './QuizResults';
import QuizSettings from './QuizSettings';
import QuizHistory from './QuizHistory';
import ThemeToggle from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, FileText, Sparkles } from 'lucide-react';

const QuizApp = () => {
  const { quizStarted, quizFinished, questions } = useQuiz();
  const [showHistory, setShowHistory] = useState(false); // State for history view

  // Log the state to help debug
  useEffect(() => {
    console.log("Quiz state:", { quizStarted, quizFinished, questionsCount: questions.length });
  }, [quizStarted, quizFinished, questions]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-secondary dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-5xl shadow-xl overflow-hidden">
        <CardHeader className="text-center bg-muted/40 dark:bg-muted/20 border-b">
          <CardTitle className="text-3xl font-extrabold tracking-tight text-primary">
            MCQ Quiz Taker
          </CardTitle>
          <p className="text-muted-foreground mt-1">
            Craft and conquer your custom quizzes!
          </p>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          {showHistory ? (
            <QuizHistory onCloseHistory={() => setShowHistory(false)} />
          ) : (
            <>
              {!quizStarted && !quizFinished && (
                <div className="space-y-6">
                  {questions.length > 0 && <QuizSettings />}
                  
                  <Tabs defaultValue="manual" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="manual" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Manual Input
                      </TabsTrigger>
                      <TabsTrigger value="ai" className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Gemini AI
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="manual">
                      <QuizInput />
                    </TabsContent>
                    <TabsContent value="ai">
                      <GeminiAI />
                    </TabsContent>
                  </Tabs>
                  
                  {/* View History Button */}
                  <div className="flex justify-center pt-4">
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
      </Card>

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} MMM. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default QuizApp;
