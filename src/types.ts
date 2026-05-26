export interface VocabItem {
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
}

export interface GrammarTopic {
  title: string;
  content: string;
  examples: string[];
}

export interface PronunciationTopic {
  title: string;
  explanation: string;
  examples: string[];
}

export interface Question {
  id: string;
  question: string;
  type: 'single-choice' | 'reorder' | 'rewrite';
  options?: string[];
  correctValue: string; // Correct choice or correct reordered/rewritten sentence
  explanation: string;
  groupHeader?: string; // Optional header for a group of questions (like reading passage or pronunciation rule instruction)
}

export interface Exercise {
  id: string;
  title: string;
  questions: Question[];
}

export interface TextbookUnit {
  id: number;
  un: string; // e.g., "Unit 1"
  title: string;
  vietnameseTitle: string;
  overview: string;
  coverImageUrl?: string;
  theoryVideoUrl?: string;
  theoryPdfUrl?: string;
  documentUrl?: string;
  slidePdfUrl?: string;
  vocabulary: VocabItem[];
  grammar: GrammarTopic[];
  pronunciation: PronunciationTopic;
  exercises: Question[];
}

export interface ExamSection {
  id: string;
  title: string;
  instruction: string;
  passage?: string; // Reading comprehension text, if any
  questions: Question[];
}

export interface MockExam {
  id: string;
  title: string;
  duration: number; // in minutes (e.g., 60 minutes)
  sourcePdfUrl?: string;
  coverImageUrl?: string;
  sections: ExamSection[];
}

export interface UserExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswersCount: number;
  timeSpentSeconds: number;
  submittedAt: string;
  answers: Record<string, string>; // questionId -> user response text
}
