import React, { useEffect, useState } from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import { useFlashcard } from '@/hooks/useFlashcard';
import { useAuth } from '@/contexts/AuthContext';
import { AuthForm } from './AuthForm';
import { UserProfile } from './UserProfile';
import { GuestProfile } from './GuestProfile';
import QuizInput from './QuizInput';
import GeminiAI from './GeminiAI';
import FlashcardGenerator from './FlashcardGenerator';
import FlashcardViewer from './FlashcardViewer';
import QuizQuestion from './QuizQuestion';
import QuizResults from './QuizResults';
import QuizSettings from './QuizSettings';
import FlashcardSettings from './FlashcardSettings';
import QuizHistory from './QuizHistory';
import FlashcardHistory from './FlashcardHistory';
import ThemeToggle from './ThemeToggle';
import MobileNavToggle from './MobileNavToggle';
import MobileBottomNav from './MobileBottomNav';
import MobileSidebar from './MobileSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, FileText, Sparkles, Settings, Loader2, Layers, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const QuizApp = () => {
  const { quizStarted, quizFinished, questions } = useQuiz();
  const { currentDeck, isStudying } = useFlashcard();
  const { user, loading, isGuest, continueAsGuest } = useAuth();
  
  const [showHistory, setShowHistory] = useState(false);
  const [showFlashcardHistory, setShowFlashcardHistory] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'flashcards'>('home');
  const [currentTab, setCurrentTab] = useState<'manual' | 'ai' | 'flashcards'>('manual');
  // Log the state to help debug
  useEffect(() => {
    console.log("App state:", { 
      quizStarted, 
      quizFinished, 
      questionsCount: questions.length,
      currentDeck: currentDeck?.title,
      isStudying,
      currentView
    });
  }, [quizStarted, quizFinished, questions, currentDeck, isStudying, currentView]);
  // Auto-switch to flashcards view when a deck is generated
  useEffect(() => {
    if (currentDeck && currentView === 'home' && currentTab === 'flashcards') {
      setCurrentView('flashcards');
    }
  }, [currentDeck, currentView, currentTab]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }  // Show authentication form if user is not signed in and not in guest mode
  if (!user && !isGuest) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 transition-colors duration-300 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-purple-100/50 dark:from-blue-900/30 dark:to-purple-900/30"></div>
          <div className="absolute inset-0 pattern-dots"></div>
        </div>
        
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        
        <div className="w-full max-w-md space-y-4 relative z-10">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-xl"></div>
              <div className="relative z-10 flex items-center justify-center">
                <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center">
                  <div className="text-white text-sm font-bold">Q</div>
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MCQ Quiz Taker
            </h1>
            <p className="text-sm text-muted-foreground">
              Craft and conquer your custom quizzes
            </p>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-6">
            <AuthForm />
          </div>
          
          {/* Continue as Guest Button */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-transparent px-4 text-muted-foreground font-medium">
                Or
              </span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={continueAsGuest}
            className="w-full h-10 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 font-medium"
          >
            Continue as Guest
          </Button>
          
          <div className="text-center text-xs text-muted-foreground space-y-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
            <p className="font-medium">Sign up to securely store your API keys</p>
            <p className="text-amber-600 dark:text-amber-400 font-medium">              Guest mode: Data stored locally only
            </p>
          </div>
        </div>
        
        <footer className="mt-6 text-center text-xs text-muted-foreground relative z-10">
          <p>© {new Date().getFullYear()} Made with ❤️ by MMM</p>
        </footer>
      </div>
    );
  }  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 transition-all duration-300 relative pb-20 md:pb-4">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-purple-100/50 dark:from-blue-900/30 dark:to-purple-900/30"></div>
        <div className="absolute inset-0 pattern-dots"></div>
      </div>      
      <div className="absolute top-6 right-6 hidden md:flex items-center gap-2 z-50">
        {user ? <UserProfile /> : <GuestProfile />}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSettingsOpen(true)}
          className="text-muted-foreground hover:text-foreground backdrop-blur-sm bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-200"
        >
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
        <ThemeToggle />
      </div>
      
      {/* Mobile Sidebar - replaces MobileNavToggle */}
      <MobileSidebar 
        onShowHistory={() => setShowHistory(true)} 
        onShowFlashcardHistory={() => setShowFlashcardHistory(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        currentView={currentView}
      />
      
      <Card className="w-full max-w-5xl shadow-2xl overflow-hidden backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border-0 relative z-10"><CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white border-0 p-6 md:p-8">
          <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center relative">
              <div className="absolute inset-0 bg-white/10 rounded-lg transform rotate-3"></div>
              <div className="relative z-10 text-white text-lg font-black">Q</div>
            </div>
            MCQ Quiz Taker
          </CardTitle>
          <p className="text-blue-50 mt-2 text-sm sm:text-base md:text-lg font-medium">
            Craft and conquer your custom quizzes with AI power!
          </p>
        </CardHeader>        <CardContent className="p-4 sm:p-6 md:p-8">
          {showHistory ? (
            <QuizHistory onCloseHistory={() => setShowHistory(false)} />
          ) : showFlashcardHistory ? (
            <FlashcardHistory onCloseHistory={() => setShowFlashcardHistory(false)} />
          ) : currentView === 'flashcards' ? (
            <div className="space-y-4">              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentView('home');
                    // Optional: Clear the current deck when going back to allow creating new flashcards
                    // Uncomment the next line if you want this behavior:
                    // setCurrentDeck(null);
                  }}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
                <h2 className="text-xl font-semibold">Flashcards</h2>
              </div>
              {currentDeck ? <FlashcardViewer /> : <FlashcardGenerator />}
              
              {/* View Flashcard History Button - only show on tablet/desktop */}
              <div className="hidden md:flex justify-center pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowFlashcardHistory(true)}
                  className="btn-gradient flex items-center gap-2 h-12 px-6 border-green-200 dark:border-green-700 transition-all duration-200"
                >
                  <Layers className="h-5 w-5" />
                  <span className="font-medium">View Flashcard History</span>
                </Button>
              </div>
            </div>
          ) : (
            <>              {!quizStarted && !quizFinished && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Desktop Tabs */}
                  <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as 'manual' | 'ai' | 'flashcards')} className="w-full hidden md:block">
                    <TabsList className="tabs-enhanced grid w-full grid-cols-3 mb-6 h-12">
                      <TabsTrigger value="manual" className="tab-trigger-enhanced flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                        <FileText className="h-4 w-4" />
                        <span>Manual Input</span>
                      </TabsTrigger>
                      <TabsTrigger value="ai" className="tab-trigger-enhanced flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400">
                        <Sparkles className="h-4 w-4" />
                        <span>Gemini AI</span>
                      </TabsTrigger>
                      <TabsTrigger value="flashcards" className="tab-trigger-enhanced flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400">
                        <Layers className="h-4 w-4" />
                        <span>Flashcards</span>
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="manual">
                      <QuizInput />
                    </TabsContent>
                    <TabsContent value="ai">
                      <GeminiAI />
                    </TabsContent>
                    <TabsContent value="flashcards">
                      <FlashcardGenerator />
                    </TabsContent>
                  </Tabs>
                  
                  {/* Mobile Content - no tabs, direct content based on currentTab */}
                  <div className="md:hidden">
                    {currentTab === 'manual' && <QuizInput />}
                    {currentTab === 'ai' && <GeminiAI />}
                    {currentTab === 'flashcards' && <FlashcardGenerator />}
                  </div>{/* View History Buttons - only show on tablet/desktop */}
                  <div className="hidden md:flex justify-center gap-4 pt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowHistory(true)}
                      className="btn-gradient flex items-center gap-2 h-12 px-6 border-indigo-200 dark:border-indigo-700 transition-all duration-200"
                    >
                      <History className="h-5 w-5" />
                      <span className="font-medium">View Quiz History</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowFlashcardHistory(true)}
                      className="btn-gradient flex items-center gap-2 h-12 px-6 border-green-200 dark:border-green-700 transition-all duration-200"
                    >
                      <Layers className="h-5 w-5" />
                      <span className="font-medium">View Flashcard History</span>
                    </Button>
                  </div>
                </div>
              )}

              {quizStarted && !quizFinished && questions.length > 0 && <QuizQuestion />}

              {quizFinished && <QuizResults />}
            </>
          )}        </CardContent>
      </Card>
        {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        currentView={currentView}
        currentTab={currentTab}
        onViewChange={setCurrentView}
        onTabChange={setCurrentTab}
        onOpenSettings={() => setSettingsOpen(true)}
        isQuizActive={quizStarted || quizFinished || isStudying || showHistory || showFlashcardHistory}
      />
      
      <footer className="mt-4 sm:mt-8 text-center text-xs sm:text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Made with ❤️ by MMM</p>
      </footer>{/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-lg font-semibold">
              <Settings className="mr-2 h-5 w-5 text-primary" />
              Settings
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="quiz" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quiz">Quiz Settings</TabsTrigger>
              <TabsTrigger value="flashcards">Flashcard Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="quiz" className="mt-4">
              <QuizSettings asCard={false} />
            </TabsContent>
            <TabsContent value="flashcards" className="mt-4">
              <FlashcardSettings asCard={false} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizApp;
