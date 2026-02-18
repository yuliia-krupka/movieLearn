export interface LearningItemDto {
    id: number;
    type: 'FLASH_CARD' | 'TEST';
    text: string;
    answers?: string[];
    exampleSentence?: string;
    translation: string;
    learningSetId: number;
}

export interface LearningSetDto {
    id: number;
    name: string;
    date: string;
    movieId: number;
    learningItems: LearningItemDto[];
}

export interface FlashCardData {
    word: string;
    translation: string;
    exampleSentence?: string;
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
    question: string;
    answers: string[];
    correctAnswerIndex: number;
    translation: string;
}

export interface ApiFlashCard {
    id: number;
    text: string;
    translation: string;
    exampleSentence?: string;
}

export interface ApiTestItem {
    id: number;
    text: string;
    answers: string[];
    correctAnswerIndex: number;
    translation: string;
}
