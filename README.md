# MCQ Quiz Taker

A versatile application for creating and taking multiple-choice quizzes. This tool helps you create, attempt, and review quizzes efficiently.

## Features

- **Manual Quiz Creation**: Create quizzes by inputting questions in a simple format
- **Google Gemini AI Integration**: Generate quiz questions from uploaded documents
- **PDF Support**: Upload PDF files to generate quizzes from their content
- **Custom Instructions**: Add specific instructions to guide AI quiz generation
- **Multiple Question Formats**: Supports various question numbering styles
- **Immediate Feedback**: See explanations for correct/incorrect answers
- **Quiz History**: Review past quiz attempts
- **Customizable Settings**: Shuffle questions, shuffle options, and more

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file (copy from `.env.example`) and add your Google API key:
   ```
   VITE_GOOGLE_API_KEY="your-api-key-here"
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Using Google Gemini AI

1. Obtain a Google AI API key from [Google AI Studio](https://makersuite.google.com/)
2. Either add it to your `.env` file or paste it directly in the application
3. Upload a PDF or text file with educational content
4. Add optional custom instructions
5. Click "Generate Questions" to create a quiz
6. Start the quiz to begin answering questions

## Question Format

Questions can be formatted in several ways:

```
1. What is the capital of France?
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
D) Emily Brontë
```

Mark correct answers with an asterisk (*) at the end.

## Technologies Used

- React
- Vite
- Tailwind CSS
- Google Generative AI (Gemini model)
- PDF.js for PDF text extraction

## License

MIT
