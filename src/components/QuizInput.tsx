import React, { useState, useRef, useEffect } from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, FileText } from 'lucide-react';

const QuizInput = () => {
  const { parseQuestions, startQuiz, questions } = useQuiz();
  const [inputText, setInputText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isParsed, setIsParsed] = useState(false);

  useEffect(() => {
    setIsParsed(questions.length > 0);
  }, [questions]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text);
      parseQuestions(text);
      toast({
        title: "File Uploaded Successfully",
        description: "Your quiz questions have been loaded.",
      });
    };
    reader.readAsText(file);
  };

  const handleTextInput = () => {
    if (!inputText.trim()) {
      toast({
        title: "Empty Input",
        description: "Please provide quiz questions.",
        variant: "destructive",
      });
      return;
    }

    parseQuestions(inputText);
    setIsParsed(true);
    toast({
      title: "Questions Parsed Successfully",
      description: "Your quiz questions have been loaded.",
    });
  };

  const handleStartQuiz = () => {
    if (questions.length === 0) {
      toast({
        title: "No Questions",
        description: "Please parse questions before starting the quiz.",
        variant: "destructive",
      });
      return;
    }

    console.log("Starting quiz with questions:", questions);
    startQuiz();
  };
  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <h2 className="text-xl sm:text-2xl font-semibold text-center text-foreground">Manual Input</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start">
        {/* Left Column: Upload and Paste */}
        <div>
          <input
            type="file"
            accept=".txt"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full mb-3 sm:mb-4 text-xs sm:text-sm"
            variant="outline"
          >
            <Upload className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Upload Documents (PDF, DOC, TXT)
          </Button>

          <div className="relative">
            <Textarea
              placeholder="Or paste your questions here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[150px] sm:min-h-[250px] text-sm focus-visible:ring-primary focus-visible:ring-offset-1"
            />
          </div>
        </div>

        {/* Right Column: Format Example */}
        <Alert className="bg-muted/50 dark:bg-muted/20 border-border">
          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          <AlertTitle className="font-semibold text-sm sm:text-base">Expected Format</AlertTitle>
          <AlertDescription className="mt-1 sm:mt-2 space-y-1 sm:space-y-2">
            <p className="text-xs text-muted-foreground">
              Questions start with "Q:" or numbers (1., 2.). Mark the correct answer with an asterisk (*). Explanations are optional.
            </p>
            <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-[150px] sm:max-h-[200px] p-2 sm:p-3 bg-background dark:bg-muted/30 rounded-md border border-border scrollbar-thin scrollbar-webkit">
{`1. What is the capital of France?
A) Berlin
    Explanation: Berlin is the capital of Germany.
B) Madrid
    Explanation: Madrid is the capital of Spain.
C) Paris*
    Explanation: Correct! Paris is the capital of France.
D) Rome
    Explanation: Rome is the capital of Italy.

Q: Who wrote "Pride and Prejudice"?
A) Charlotte Brontë
B) Jane Austen*
C) Mary Shelley
D) Emily Brontë`}
            </pre>
          </AlertDescription>
        </Alert>
      </div>      
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-3 sm:pt-4 border-t border-border">
        <Button
          onClick={handleTextInput}
          variant="secondary"
          className="flex-1 sm:flex-none sm:w-48 text-xs sm:text-sm h-9 sm:h-10"
          disabled={!inputText.trim()} // Disable if textarea is empty
        >
          Parse Text Input
        </Button>
        <Button
          onClick={handleStartQuiz}
          className="flex-1 sm:flex-none sm:w-48 bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm h-9 sm:h-10"
          disabled={!isParsed} // Disable if no questions parsed
        >
          Start Quiz {questions.length > 0 ? `(${questions.length})` : ''}
        </Button>
      </div>
    </div>
  );
};

export default QuizInput;
