import React, { useState, useRef, useEffect } from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import { useHistory } from '@/contexts/HistoryContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Info, Loader2, Save, Check, BookOpen, BrainCircuit } from 'lucide-react';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { supabaseSecureStorage } from '@/lib/supabaseSecureStorage';

const GeminiAI = () => {  
  const { parseQuestions, startQuiz, questions, setQuizTitle, settings } = useQuiz();
  const { addHistoryEntry, isHistoryEnabled } = useHistory();
  const { user, isGuest } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [topicInstructions, setTopicInstructions] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [isLoadingApiKey, setIsLoadingApiKey] = useState(false);
  const [topic, setTopic] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('medium');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null);
  const [useAllFiles, setUseAllFiles] = useState(true);
  // Load saved API key on component mount and when user changes
  useEffect(() => {
    const loadApiKey = async () => {
      if (!user && !isGuest) {
        setApiKey('');
        setApiKeySaved(false);
        return;
      }

      setIsLoadingApiKey(true);
      try {
        let savedApiKey;
        if (isGuest) {
          // For guest mode, use localStorage
          savedApiKey = localStorage.getItem('gemini_api_key');
        } else {
          // For authenticated users, use Supabase
          savedApiKey = await supabaseSecureStorage.getApiKey();
        }
        
        if (savedApiKey) {
          setApiKey(savedApiKey);
          setApiKeySaved(true);
        } else {
          setApiKey('');
          setApiKeySaved(false);
        }
      } catch (error) {
        console.error('Error loading API key:', error);
        setApiKey('');
        setApiKeySaved(false);
      } finally {
        setIsLoadingApiKey(false);
      }
    };

    loadApiKey();
  }, [user, isGuest]);
  // Save API key to Supabase or localStorage
  const saveApiKey = async () => {
    if (!user && !isGuest) {
      toast({
        title: "Authentication Required",
        description: "Please sign in or continue as guest to save your API key.",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey.trim()) {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid API key.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingApiKey(true);
    try {
      if (isGuest) {
        // For guest mode, save to localStorage
        localStorage.setItem('gemini_api_key', apiKey.trim());
        setApiKeySaved(true);
        toast({
          title: "API Key Saved",
          description: "Your API key has been saved locally in your browser.",
        });
      } else {
        // For authenticated users, save to Supabase
        const result = await supabaseSecureStorage.storeApiKey(apiKey.trim());
        if (result.success) {
          setApiKeySaved(true);
          toast({
            title: "API Key Saved",
            description: "Your API key has been saved securely.",
          });
        } else {
          console.error('Failed to save API key:', result.error);
          toast({
            title: "Save Failed",
            description: result.error || "Failed to save API key.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        title: "Save Failed",
        description: "An unexpected error occurred while saving your API key.",
        variant: "destructive",
      });    } finally {
      setIsLoadingApiKey(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Only support document files
    const supportedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    
    // Process each uploaded file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (supportedTypes.includes(file.type) || file.type.includes('text')) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    }
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Unsupported File Format",
        description: `The following files are not supported: ${invalidFiles.join(', ')}. Please upload PDF, DOC, DOCX, or TXT files only.`,
        variant: "destructive",
      });
    }
      if (validFiles.length > 0) {
      // Add new files to existing files
      setUploadedFiles(prev => [...prev, ...validFiles]);
      
      // By default, use all files
      setUseAllFiles(true);
      
      // Only set selected index if we're not using all files and none is currently selected
      if (!useAllFiles && selectedFileIndex === null && validFiles.length > 0) {
        setSelectedFileIndex(0);
      }
      
      toast({
        title: "Files Uploaded Successfully",
        description: `${validFiles.length} file(s) ready for processing.`,
      });
    }
  };

  // Add helper to convert ArrayBuffer to Base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Function to generate quiz questions using Gemini API
  const generateQuizQuestions = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Google AI API key.",
        variant: "destructive",
      });
      return;
    }

    if (uploadedFiles.length === 0) {
      toast({
        title: "No Files",
        description: "Please upload at least one document first.",
        variant: "destructive",
      });
      return;
    }    if (!useAllFiles && selectedFileIndex === null && uploadedFiles.length > 0) {
      toast({
        title: "No Selection",
        description: "Please select a document or enable 'Use all documents'.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Determine which files to process
      const filesToProcess = useAllFiles 
        ? uploadedFiles 
        : [uploadedFiles[selectedFileIndex!]];

      // Initialize the Google Generative AI SDK
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Configure the model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro-exp-03-25",
      safetySettings: [
        {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });

      // Create an array of content parts for the API request
      const contentParts = [];
      
      // Create quiz title based on selected files
      const quizTitle = filesToProcess.length === 1 
        ? filesToProcess[0].name.split('.')[0] 
        : 'Combined Documents Quiz';

      // Add the prompt as the first part
      let prompt = `Please create multiple-choice questions (MCQs) based on the content of the uploaded ${filesToProcess.length > 1 ? 'documents' : 'document'}. 

Follow these guidelines:
1. Format each question in this specific format:
   Q: [Question text]
   A) [Option 1]
      Explanation: [Explanation]
   B) [Option 2]
      Explanation: [Explanation]
   C) [Option 3]*
      Explanation: [Explanation]
   D) [Option 4]
      Explanation: [Explanation]
    

2. Mark the correct answer with an asterisk (*) at the end of the option.
3. Create questions covering the entire ${filesToProcess.length > 1 ? 'content across all documents' : 'document'}.
4. Make questions that test understanding, not just memorization.
5. Make sure the questions and answers are correct.
6. Include explanations for the answers.
7. Make all options plausible but ensure only one is correct.
8. Cover different topics from the ${filesToProcess.length > 1 ? 'documents' : 'document'}.`;

      // Add custom instructions if provided
      if (customInstructions.trim()) {
        prompt += `\n\nAdditional Instructions:\n${customInstructions}`;
      }
      
      // Add prompt to content parts
      contentParts.push(prompt);

      // Process each file and add to content parts
      for (const file of filesToProcess) {
        // Read file and encode as base64
        const arrayBuffer = await file.arrayBuffer();
        const base64Data = arrayBufferToBase64(arrayBuffer);
        
        // Add file part to content parts
        contentParts.push({
          inlineData: {
            data: base64Data,
            mimeType: file.type,
          }
        });
      }

      // Send prompt and all file parts to Gemini API
      const result = await model.generateContent(contentParts);
      const response = await result.response;
      const generatedText = response.text();

      // Parse the questions using the existing context
      parseQuestions(generatedText, quizTitle);
      setQuizTitle(quizTitle);

      toast({
        title: "Quiz Generated Successfully",
        description: filesToProcess.length > 1 
          ? `Your AI-generated quiz from ${filesToProcess.length} documents is ready to start.`
          : "Your AI-generated quiz is ready to start.",
      });
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast({
        title: "Error Generating Quiz",
        description: "There was an error with the Gemini API. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to generate quiz questions by topic using Gemini API
  const generateQuizByTopic = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Google AI API key.",
        variant: "destructive",
      });
      return;
    }

    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for the quiz.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Initialize the Google Generative AI SDK
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Configure the model
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-pro-exp-03-25",
        safetySettings: [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
        ],
    });

      // Build the prompt
      let prompt = `Please create ${numberOfQuestions} multiple-choice questions (MCQs) on the topic of "${topic}". The difficulty level should be ${difficultyLevel}.

Follow these guidelines:
1. Format each question in this specific format:
   Q: [Question text]
   A) [Option 1]
      Explanation: [Explanation]
   B) [Option 2]
      Explanation: [Explanation]
   C) [Option 3]* (the correct can be any option, not just C)
      Explanation: [Explanation]
   D) [Option 4]
      Explanation: [Explanation]

2. Mark the correct answer with an asterisk (*) at the end of the option.
3. Create exactly ${numberOfQuestions} questions covering different aspects of the topic.
4. Make questions that test understanding, not just memorization.
5. Ensure all information is factually accurate.
6. Include clear explanations for the answers.
7. Make all options plausible but ensure only one is correct.
8. For ${difficultyLevel} difficulty, ensure the questions are appropriately challenging.`;

      // Add custom instructions if provided
      if (customInstructions.trim()) {
        prompt += `\n\nAdditional Instructions:\n${customInstructions}`;
      }

      // Send prompt
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const generatedText = response.text();

      // Parse the questions using the existing context
      parseQuestions(generatedText, `${topic} Quiz`);
      setQuizTitle(`${topic} Quiz`);

      toast({
        title: "Quiz Generated Successfully",
        description: "Your AI-generated quiz is ready to start.",
      });
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast({
        title: "Error Generating Quiz",
        description: "There was an error with the Gemini API. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  // Function to save API key securely
  const handleSaveApiKey = async () => {
    await saveApiKey();
  };
  
  const handleStartQuiz = () => {
    if (questions.length === 0) {
      toast({
        title: "No Questions",
        description: "Please generate questions before starting the quiz.",
        variant: "destructive",
      });
      return;
    }

    // Start the quiz first (this prepares the questions with shuffling if enabled)
    startQuiz();
    
    // Add to history immediately if history is enabled
    // This ensures Gemini-generated quizzes also appear in history
    if (isHistoryEnabled) {
      // Since we haven't taken the quiz yet, we'll record a "0" score initially
      // The actual score will be saved again when the user completes the quiz
      addHistoryEntry(0, questions.length, questions, settings);
    }
  };
  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">      
      <h2 className="text-xl sm:text-2xl font-semibold text-center text-foreground">Create Quiz with Google AI</h2>      
      
      <Tabs defaultValue="upload" className="w-full">        
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload Documents</TabsTrigger>
          <TabsTrigger value="topic">Create by Topic</TabsTrigger>
          <TabsTrigger value="settings">API Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Upload Documents</CardTitle>              
              <CardDescription className="text-xs sm:text-sm">
                Upload multiple PDF, DOC, DOCX, or TXT files to generate quiz questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">                <input
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                multiple
                title="Upload documents for quiz generation"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-xs sm:text-sm h-9 sm:h-10"
                variant="outline"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    Processing Documents...
                  </>
                ) : (                  
                  <>
                    <Upload className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Upload Documents (PDF, DOC, TXT)
                  </>
                )}
              </Button>              
              {uploadedFiles.length > 0 && !isLoading && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-xs sm:text-sm font-medium">Documents Uploaded ({uploadedFiles.length})</div>
                    {uploadedFiles.length >= 1 && (
                      <label className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={useAllFiles} 
                          onChange={(e) => {
                            setUseAllFiles(e.target.checked);
                            // Deselect individual file if we're using all files
                            if (e.target.checked) setSelectedFileIndex(null);
                          }}
                          className="form-checkbox h-3 w-3 sm:h-4 sm:w-4 rounded border-gray-300"
                        />
                        <span>Use all documents</span>
                      </label>
                    )}
                  </div>
                  <Alert className="bg-muted/50 p-2 sm:p-4">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                    <AlertTitle className="text-xs sm:text-sm">{useAllFiles ? "All Documents Selected" : "Select a Document"}</AlertTitle>
                    <AlertDescription className={`text-xs ${useAllFiles ? "opacity-50" : ""}`}>
                      {uploadedFiles.map((file, index) => (
                        <div 
                          key={index} 
                          onClick={() => {
                            if (!useAllFiles) {
                              setSelectedFileIndex(index);
                              setUseAllFiles(false);
                            }
                          }} 
                          className={`cursor-pointer truncate ${!useAllFiles && selectedFileIndex === index ? 'font-bold' : ''} ${useAllFiles ? 'opacity-70' : ''}`}
                        >
                          {file.name}
                        </div>
                      ))}
                    </AlertDescription>
                  </Alert>
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => {
                        setUploadedFiles([]);
                        setSelectedFileIndex(null);
                        setUseAllFiles(false);
                      }}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="space-y-1 sm:space-y-2">                
                <label htmlFor="customInstructions" className="text-xs sm:text-sm font-medium">
                  Custom Instructions (Optional)
                </label>
                <Textarea
                  id="customInstructions"
                  placeholder="Add any specific instructions for the AI quiz generation (e.g., 'Focus on chapter 3', 'Create 10 questions', 'Make easier questions', etc.)"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  className="min-h-[80px] sm:min-h-[100px] text-xs sm:text-sm"
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Button Row for Upload tab */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button
              onClick={generateQuizQuestions}
              className="flex-1 sm:flex-none sm:w-48 text-xs sm:text-sm h-9 sm:h-10"
              disabled={isLoading || !apiKeySaved || (uploadedFiles.length === 0) || (!useAllFiles && selectedFileIndex === null)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BrainCircuit className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Generate Quiz
                </>
              )}
            </Button>
            <Button
              onClick={handleStartQuiz}
              className="flex-1 sm:flex-none sm:w-48 bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm h-9 sm:h-10"
              disabled={isLoading || questions.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <BookOpen className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Start Quiz {questions.length > 0 ? `(${questions.length})` : ''}
                </>
              )}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="topic" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Create by Topic</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Generate quiz questions on any topic without uploading a document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="topic" className="text-xs sm:text-sm font-medium">
                  Topic
                </label>
                <Input
                  id="topic"
                  placeholder="Enter a topic (e.g., 'Solar System', 'World War II', 'JavaScript Basics')"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="text-xs sm:text-sm h-8 sm:h-10"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1 sm:space-y-2">
                  <label htmlFor="difficulty" className="text-xs sm:text-sm font-medium">
                    Difficulty Level
                  </label>
                  <select
                    id="difficulty"
                    className="flex h-8 sm:h-10 w-full rounded-md border border-input bg-background px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm ring-offset-background 
                              file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground 
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
                              disabled:cursor-not-allowed disabled:opacity-50"
                    value={difficultyLevel}
                    onChange={(e) => setDifficultyLevel(e.target.value)}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                
                <div className="space-y-1 sm:space-y-2">
                  <label htmlFor="numberOfQuestions" className="text-xs sm:text-sm font-medium">
                    Number of Questions
                  </label>
                  <Input
                    id="numberOfQuestions"
                    type="number"
                    min="5"
                    max="30"
                    value={numberOfQuestions}
                    onChange={(e) => setNumberOfQuestions(parseInt(e.target.value) || 10)}
                    className="text-xs sm:text-sm h-8 sm:h-10"
                  />
                </div>
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="topicInstructions" className="text-xs sm:text-sm font-medium">
                  Custom Instructions (Optional)
                </label>                
                <Textarea
                  id="topicInstructions"
                  placeholder="Add any specific instructions for the AI quiz generation (e.g., 'Focus on recent developments', 'Include questions about specific subtopics', etc.)"
                  value={topicInstructions}
                  onChange={(e) => setTopicInstructions(e.target.value)}
                  className="min-h-[80px] sm:min-h-[100px] text-xs sm:text-sm"
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Button Row for Topic tab */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button
              onClick={generateQuizByTopic}
              className="flex-1 sm:flex-none sm:w-48 text-xs sm:text-sm h-9 sm:h-10"
              disabled={isLoading || !apiKeySaved || !topic.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BrainCircuit className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Generate Quiz
                </>
              )}
            </Button>
            <Button
              onClick={handleStartQuiz}
              className="flex-1 sm:flex-none sm:w-48 bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm h-9 sm:h-10"
              disabled={isLoading || questions.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <BookOpen className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Start Quiz {questions.length > 0 ? `(${questions.length})` : ''}
                </>
              )}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">API Settings</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Configure your Google AI (Gemini) settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              <div className="space-y-2">
                <label htmlFor="apiKey" className="text-xs sm:text-sm font-medium">
                  Google AI API Key
                </label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your Google AI API key"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setApiKeySaved(false);
                  }}
                  className="text-xs sm:text-sm h-8 sm:h-10"
                />                  <p className="text-xs text-muted-foreground">
                  <Info className="inline-block h-3 w-3 mr-1" />
                  {user ? 
                    "Your API key is stored securely in Supabase with encryption" :
                    "Sign in to store your API key securely in the cloud"
                  }
                </p>
                <Button
                  onClick={handleSaveApiKey}
                  className="mt-2 text-xs sm:text-sm h-8 sm:h-10"
                  variant="secondary"
                  disabled={!apiKey.trim() || apiKeySaved || isLoadingApiKey || (!user && !isGuest)}
                >
                  {isLoadingApiKey ? (
                    <>
                      <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      Saving...
                    </>
                  ) : apiKeySaved ? (
                    <>
                      <Check className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      API Key Saved
                    </>
                  ) : (
                    <>
                      <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      {(user || isGuest) ? "Save API Key" : "Sign In Required"}
                    </>
                  )}
                </Button>
              </div>
              
              <Alert className="bg-muted/50 p-2 sm:p-4 mt-2">
                <Info className="h-3 w-3 sm:h-4 sm:w-4" />
                <AlertTitle className="text-xs sm:text-sm">How to get a Google AI API Key</AlertTitle>
                <AlertDescription className="text-xs">
                  <ol className="list-decimal pl-4 mt-1 space-y-1">
                    <li>Go to <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a></li>
                    <li>Sign in with your Google account</li>
                    <li>Navigate to "Get API key" from the top menu</li>
                    <li>Create a new API key and copy it</li>
                    <li>Paste it here and click "Save API Key"</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GeminiAI;
