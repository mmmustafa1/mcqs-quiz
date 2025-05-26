import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import type { Flashcard, FlashcardDeck } from '@/contexts/FlashcardContext';

export interface FlashcardGenerationOptions {
  numberOfCards: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  focusAreas?: string[];
  cardType: 'question-answer' | 'term-definition' | 'concept-explanation' | 'mixed';
}

export interface FlashcardGenerationResult {
  success: boolean;
  deck?: FlashcardDeck;
  error?: string;
}

interface RawFlashcardData {
  front: string;
  back: string;
  difficulty: string;
  category: string;
}

export class FlashcardGenerationService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor(apiKey: string) {
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  private getFlashcardPrompt(
    content: string,
    options: FlashcardGenerationOptions,
    source: 'document' | 'prompt'
  ): string {
    const difficultyGuidance = {
      easy: 'Focus on basic concepts, simple definitions, and fundamental facts. Keep questions straightforward.',
      medium: 'Include some analysis and application questions. Mix basic concepts with moderate complexity.',
      hard: 'Include complex analysis, synthesis, and evaluation questions. Challenge deeper understanding.',
      mixed: 'Vary difficulty levels - include easy, medium, and hard questions for comprehensive review.'
    };

    const cardTypeGuidance = {
      'question-answer': 'Create questions on the front and comprehensive answers on the back.',
      'term-definition': 'Put terms/concepts on the front and their definitions/explanations on the back.',
      'concept-explanation': 'Put concepts on the front and detailed explanations on the back.',
      'mixed': 'Use a variety of formats - questions/answers, terms/definitions, and concept explanations.'
    };

    return `You are an educational content expert specializing in creating effective flashcards for learning and retention.

CONTENT TO PROCESS:
${content}

GENERATION REQUIREMENTS:
- Generate exactly ${options.numberOfCards} flashcards
- Difficulty level: ${options.difficulty}
- Card type: ${options.cardType}
- Source: ${source}
${options.focusAreas && options.focusAreas.length > 0 ? `- Focus areas: ${options.focusAreas.join(', ')}` : ''}

DIFFICULTY GUIDANCE:
${difficultyGuidance[options.difficulty]}

CARD TYPE GUIDANCE:
${cardTypeGuidance[options.cardType]}

QUALITY GUIDELINES:
1. Make the front side clear, concise, and specific
2. Provide comprehensive but focused answers on the back
3. Ensure each flashcard tests a single concept or fact
4. Use active voice and clear language
5. Include context when necessary for understanding
6. Vary question types to maintain engagement
7. Ensure factual accuracy and consistency
8. Make cards self-contained (no references to "the text" or "above")

FORMATTING RULES:
- Front side: Maximum 150 characters for optimal readability
- Back side: Maximum 500 characters, but aim for 200-300 for best retention
- Use proper punctuation and grammar
- Avoid overly complex terminology unless necessary
- Include examples where helpful

OUTPUT FORMAT:
Return a valid JSON array with this exact structure (no additional text or formatting):
[
  {
    "front": "Clear, concise question or term",
    "back": "Comprehensive but focused answer or definition",
    "difficulty": "easy|medium|hard",
    "category": "relevant_topic_category"
  }
]

IMPORTANT: 
- Return ONLY the JSON array, no additional text
- Ensure all JSON is properly formatted and valid
- Each flashcard must have all four required fields
- Categories should be descriptive but concise (max 30 characters)
- Difficulty should match the requested level or be appropriate for mixed difficulty`;
  }

  async generateFlashcardsFromText(
    text: string,
    options: FlashcardGenerationOptions,
    title?: string
  ): Promise<FlashcardGenerationResult> {
    if (!this.genAI) {
      return {
        success: false,
        error: 'Gemini AI not initialized. Please check your API key.'
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-flash-preview-05-20",
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });

      const prompt = this.getFlashcardPrompt(text, options, 'prompt');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      // Parse the JSON response
      const flashcardsData = this.parseFlashcardsResponse(responseText);
      
      if (!flashcardsData || flashcardsData.length === 0) {
        return {
          success: false,
          error: 'No flashcards could be generated from the provided content.'
        };
      }

      // Create flashcard objects with unique IDs
      const flashcards: Flashcard[] = flashcardsData.map((card, index) => ({
        id: `card_${Date.now()}_${index}`,
        front: card.front,
        back: card.back,
        difficulty: card.difficulty as 'easy' | 'medium' | 'hard',
        category: card.category,
        created_at: new Date().toISOString(),
      }));

      // Create the deck
      const deck: FlashcardDeck = {
        id: `deck_${Date.now()}`,
        title: title || `Flashcard Deck - ${new Date().toLocaleDateString()}`,
        description: `Generated from prompt with ${flashcards.length} cards`,
        flashcards,
        created_at: new Date().toISOString(),
        source: 'prompt',
        metadata: {
          total_count: flashcards.length,
          generated_at: new Date().toISOString(),
        },
      };

      return {
        success: true,
        deck,
      };

    } catch (error) {
      console.error('Error generating flashcards:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during generation'
      };
    }
  }

  async generateFlashcardsFromDocument(
    file: File,
    options: FlashcardGenerationOptions,
    title?: string
  ): Promise<FlashcardGenerationResult> {
    if (!this.genAI) {
      return {
        success: false,
        error: 'Gemini AI not initialized. Please check your API key.'
      };
    }

    try {
      // Extract text from file
      const text = await this.extractTextFromFile(file);
      
      if (!text || text.trim().length === 0) {
        return {
          success: false,
          error: 'No text content could be extracted from the file.'
        };
      }

      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-flash-preview-05-20",
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });

      const prompt = this.getFlashcardPrompt(text, options, 'document');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      // Parse the JSON response
      const flashcardsData = this.parseFlashcardsResponse(responseText);
      
      if (!flashcardsData || flashcardsData.length === 0) {
        return {
          success: false,
          error: 'No flashcards could be generated from the document content.'
        };
      }

      // Create flashcard objects with unique IDs
      const flashcards: Flashcard[] = flashcardsData.map((card, index) => ({
        id: `card_${Date.now()}_${index}`,
        front: card.front,
        back: card.back,
        difficulty: card.difficulty as 'easy' | 'medium' | 'hard',
        category: card.category,
        created_at: new Date().toISOString(),
      }));

      // Create the deck
      const deck: FlashcardDeck = {
        id: `deck_${Date.now()}`,
        title: title || `Flashcards from ${file.name}`,
        description: `Generated from document with ${flashcards.length} cards`,
        flashcards,
        created_at: new Date().toISOString(),
        source: 'document',
        metadata: {
          total_count: flashcards.length,
          generated_at: new Date().toISOString(),
        },
      };

      return {
        success: true,
        deck,
      };

    } catch (error) {
      console.error('Error generating flashcards from document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during generation'
      };
    }
  }

  private async extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      // For now, only handle text files
      // In a real implementation, you'd want to handle PDF, DOCX, etc.
      if (file.type.includes('text') || file.type === 'text/plain') {
        reader.readAsText(file);
      } else {
        reject(new Error('Unsupported file type. Please use text files for now.'));
      }
    });
  }

  private parseFlashcardsResponse(responseText: string): RawFlashcardData[] | null {
    try {
      // Clean the response text
      let cleanedText = responseText.trim();
      
      // Remove any markdown code block formatting
      cleanedText = cleanedText.replace(/```json\s*/g, '');
      cleanedText = cleanedText.replace(/```\s*/g, '');
      
      // Try to find JSON array in the response
      const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }
      
      const parsed = JSON.parse(cleanedText);
      
      if (Array.isArray(parsed)) {
        // Validate that each item has required fields
        const validCards = parsed.filter(card => 
          card.front && 
          card.back && 
          card.difficulty && 
          card.category
        );
        
        return validCards;
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing flashcards response:', error);
      console.error('Response text:', responseText);
      return null;
    }
  }
}
