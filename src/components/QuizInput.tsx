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
  };  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">📝 Manual Input</h2>
        <p className="text-muted-foreground">Upload a file or paste your quiz questions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Upload and Paste */}
        <div className="space-y-4">          <input
            type="file"
            accept=".txt,.pdf,.doc,.docx"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            aria-label="Upload quiz document file"
          />
          
          <div className="card-enhanced p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Upload Document
            </h3>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full btn-gradient"
              variant="outline"
            >
              <Upload className="mr-2 h-4 w-4" /> 
              Choose File (PDF, DOC, TXT)
            </Button>
          </div>

          <div className="card-enhanced p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Paste Text
            </h3>
            <Textarea
              placeholder="Paste your quiz questions here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[200px] text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
            />
          </div>
        </div>

        {/* Right Column: Format Example */}
        <div className="card-enhanced p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
            Expected Format
          </h3>
          <div className="text-sm text-muted-foreground mb-4">
            Questions start with "Q:" or numbers (1., 2.). Mark the correct answer with an asterisk (*). Explanations are optional.
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-[250px] text-gray-700 dark:text-gray-300">
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
          </div>
        </div>
      </div>      
      
      {/* Enhanced Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={handleTextInput}
          variant="outline"
          className="sm:w-48 h-12 text-sm font-semibold border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300"
          disabled={!inputText.trim()}
        >
          🔍 Parse Text Input
        </Button>        <Button
          onClick={handleStartQuiz}
          className={`sm:w-48 h-12 text-sm font-semibold transition-all duration-300 ${
            isParsed 
              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105" 
              : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          }`}
          disabled={!isParsed}
        >
          🚀 Start Quiz {questions.length > 0 ? `(${questions.length})` : ''}
        </Button>
      </div>
      
      {/* Status Indicator */}
      {questions.length > 0 && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full text-green-800 dark:text-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              {questions.length} question{questions.length !== 1 ? 's' : ''} ready!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizInput;
