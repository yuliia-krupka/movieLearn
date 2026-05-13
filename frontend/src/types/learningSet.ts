export interface LearningItemDto {
    id: number;
    type: 'FLASH_CARD' | 'TEST';
    text: string;
    answers?: string[];
    exampleSentence?: string;
    transcription?: string;
    translation: string;
    learningSetId: number;
}

export interface LearningSetDto {
    id: number;
    name: string;
    date: string;
    movieId: number;
    learningItems: LearningItemDto[];
    status: 'GENERATING' | 'REVIEW' | 'READY';
    englishLevel: string;
    interests?: string;
    movieTitle?: string;
}

export interface FlashCardData {
    word: string;
    translation: string;
    exampleSentence?: string;
    transcription?: string;
    id: number;
}

export interface ItemStatusDto {
    learningItemId: number;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'LEARNED' | 'SKIPPED';
    correctAnswers: number;
    totalAttempts: number;
}

export interface TestItemData {
    id: number;
    text: string;
    answers: string[];
    correctAnswerIndex: number;
    translation: string;
    question?: string; // For backward compatibility
}

export interface ApiFlashCard {
    id: number;
    text: string;
    translation: string;
    exampleSentence?: string;
    transcription?: string;
    answers?: string[];
}

export interface ApiTestItem {
    id: number;
    text: string;
    answers: string[];
    correctAnswerIndex: number;
    translation: string;
}

export interface MovieProgress {
    movieId: number;
    learningSetId: number;
    movieTitle: string;
    image: string | null;
    flashcardsScore: number;
    testsScore: number;
    totalWords: number;
    learnedWords: number;
    totalAttempts: number;
    lastAttemptAt: string | null;
    englishLevel: string;
}
