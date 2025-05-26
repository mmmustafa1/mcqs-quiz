import React, { useState, useRef, useEffect } from 'react';
import { useFlashcard } from '@/hooks/useFlashcard';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Loader2, Settings, Lightbulb, BookOpen, Brain } from 'lucide-react';
import { FlashcardGenerationService, FlashcardGenerationOptions } from '@/lib/flashcardService';
import { supabaseSecureStorage } from '@/lib/supabaseSecureStorage';

const FlashcardGenerator = () => {
  const { addGeneratedDeck, isGenerating, setIsGenerating } = useFlashcard();
  const { user, isGuest } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [customInstructions, setCustomInstructions] = useState('');
  const [topicInstructions, setTopicInstructions] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [isLoadingApiKey, setIsLoadingApiKey] = useState(false);
  const [deckTitle, setDeckTitle] = useState('');
  
  // Generation options
  const [numberOfCards, setNumberOfCards] = useState(10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('medium');
  const [cardType, setCardType] = useState<'question-answer' | 'term-definition' | 'concept-explanation' | 'mixed'>('mixed');
  const [focusAreas, setFocusAreas] = useState('');

  // Load saved API key on component mount
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
          savedApiKey = localStorage.getItem('gemini_api_key');
        } else {
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
        localStorage.setItem('gemini_api_key', apiKey.trim());
        setApiKeySaved(true);
        toast({
          title: "API Key Saved",
          description: "Your API key has been saved locally in your browser.",
        });
      } else {
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
      });
    } finally {
      setIsLoadingApiKey(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const supportedTypes = ['application/pdf', 'text/plain', 'application/msword'];
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    
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
        title: "Unsupported Files",
        description: `Some files couldn't be uploaded: ${invalidFiles.join(', ')}. Please use text or PDF files.`,
        variant: "destructive",
      });
    }
    
    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      toast({
        title: "Files Uploaded",
        description: `${validFiles.length} file(s) uploaded successfully.`,
      });
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const generateFlashcardsFromPrompt = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter and save your Gemini API key first.",
        variant: "destructive",
      });
      return;
    }

    if (!topicInstructions.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter some content or topic to generate flashcards from.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const service = new FlashcardGenerationService(apiKey.trim());
      const options: FlashcardGenerationOptions = {
        numberOfCards,
        difficulty,
        cardType,
        focusAreas: focusAreas ? focusAreas.split(',').map(area => area.trim()) : undefined,
      };

      const content = customInstructions 
        ? `${topicInstructions}\n\nAdditional Instructions: ${customInstructions}`
        : topicInstructions;

      const result = await service.generateFlashcardsFromText(
        content,
        options,
        deckTitle || `Flashcards - ${new Date().toLocaleDateString()}`
      );

      if (result.success && result.deck) {
        addGeneratedDeck(result.deck);
        toast({
          title: "Flashcards Generated!",
          description: `Successfully created ${result.deck.flashcards.length} flashcards.`,
        });
        
        // Clear form
        setTopicInstructions('');
        setCustomInstructions('');
        setDeckTitle('');
        setFocusAreas('');
      } else {
        toast({
          title: "Generation Failed",
          description: result.error || "Failed to generate flashcards.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast({
        title: "Generation Error",
        description: "An unexpected error occurred while generating flashcards.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFlashcardsFromFiles = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter and save your Gemini API key first.",
        variant: "destructive",
      });
      return;
    }

    if (uploadedFiles.length === 0) {
      toast({
        title: "No Files",
        description: "Please upload at least one file to generate flashcards from.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const service = new FlashcardGenerationService(apiKey.trim());
      const options: FlashcardGenerationOptions = {
        numberOfCards,
        difficulty,
        cardType,
        focusAreas: focusAreas ? focusAreas.split(',').map(area => area.trim()) : undefined,
      };

      // For now, use the first file
      const file = uploadedFiles[0];
      const result = await service.generateFlashcardsFromDocument(
        file,
        options,
        deckTitle || `Flashcards from ${file.name}`
      );

      if (result.success && result.deck) {
        addGeneratedDeck(result.deck);
        toast({
          title: "Flashcards Generated!",
          description: `Successfully created ${result.deck.flashcards.length} flashcards from ${file.name}.`,
        });
        
        // Clear form
        setUploadedFiles([]);
        setCustomInstructions('');
        setDeckTitle('');
        setFocusAreas('');
      } else {
        toast({
          title: "Generation Failed",
          description: result.error || "Failed to generate flashcards from document.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error generating flashcards from file:', error);
      toast({
        title: "Generation Error",
        description: "An unexpected error occurred while generating flashcards from the file.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!apiKeySaved) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Gemini AI API Key Required
            </CardTitle>
            <CardDescription>
              Enter your Gemini API key to generate flashcards with AI assistance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Gemini API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your Gemini API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <Button 
              onClick={saveApiKey} 
              disabled={isLoadingApiKey || !apiKey.trim()}
              className="w-full"
            >
              {isLoadingApiKey ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save API Key'
              )}
            </Button>
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                Get your free Gemini API key from{' '}
                <a 
                  href="https://makersuite.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google AI Studio
                </a>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Flashcard Generation Settings
          </CardTitle>
          <CardDescription>
            Customize how your flashcards are generated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deck-title">Deck Title (Optional)</Label>
              <Input
                id="deck-title"
                placeholder="My Flashcard Deck"
                value={deckTitle}
                onChange={(e) => setDeckTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="number-of-cards">Number of Cards</Label>
              <Select value={numberOfCards.toString()} onValueChange={(value) => setNumberOfCards(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 cards</SelectItem>
                  <SelectItem value="10">10 cards</SelectItem>
                  <SelectItem value="15">15 cards</SelectItem>
                  <SelectItem value="20">20 cards</SelectItem>
                  <SelectItem value="25">25 cards</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard' | 'mixed') => setDifficulty(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="card-type">Card Type</Label>
              <Select value={cardType} onValueChange={(value: 'question-answer' | 'term-definition' | 'concept-explanation' | 'mixed') => setCardType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="question-answer">Question & Answer</SelectItem>
                  <SelectItem value="term-definition">Term & Definition</SelectItem>
                  <SelectItem value="concept-explanation">Concept & Explanation</SelectItem>
                  <SelectItem value="mixed">Mixed Types</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="focus-areas">Focus Areas (Optional)</Label>
            <Input
              id="focus-areas"
              placeholder="e.g., definitions, examples, key concepts (comma-separated)"
              value={focusAreas}
              onChange={(e) => setFocusAreas(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Specify what aspects to focus on when generating flashcards.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Generation Tabs */}
      <Tabs defaultValue="prompt" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prompt" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            From Text/Prompt
          </TabsTrigger>
          <TabsTrigger value="document" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            From Document
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prompt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate from Text Content</CardTitle>
              <CardDescription>
                Enter any text content or topic you'd like to create flashcards from.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic-instructions">Content/Topic *</Label>
                <Textarea
                  id="topic-instructions"
                  placeholder="Enter the content or topic you want to create flashcards from..."
                  value={topicInstructions}
                  onChange={(e) => setTopicInstructions(e.target.value)}
                  rows={6}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-instructions">Additional Instructions (Optional)</Label>
                <Textarea
                  id="custom-instructions"
                  placeholder="Any specific instructions for generating the flashcards..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={3}
                />
              </div>
              
              <Button 
                onClick={generateFlashcardsFromPrompt}
                disabled={isGenerating || !topicInstructions.trim()}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Flashcards...
                  </>
                ) : (
                  'Generate Flashcards'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="document" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate from Document</CardTitle>
              <CardDescription>
                Upload a text file or document to create flashcards from its content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Drag and drop files here, or click to select
                  </p>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Select Files
                  </Button>                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    aria-label="Upload files for flashcard generation"
                  />
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Files:</Label>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-sm">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-instructions-doc">Additional Instructions (Optional)</Label>
                <Textarea
                  id="custom-instructions-doc"
                  placeholder="Any specific instructions for generating the flashcards..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={3}
                />
              </div>
              
              <Button 
                onClick={generateFlashcardsFromFiles}
                disabled={isGenerating || uploadedFiles.length === 0}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Flashcards...
                  </>
                ) : (
                  'Generate Flashcards from Document'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FlashcardGenerator;
