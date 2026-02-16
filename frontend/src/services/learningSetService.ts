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

const API_BASE_URL = 'http://localhost:8080/api';

export const learningSetService = {
    async getOrCreateByMovie(movieId: number): Promise<LearningSetDto> {
        const response = await fetch(`${API_BASE_URL}/learning-sets/movie/${movieId}`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Failed to get learning set: ${response.statusText}`);
        }

        return response.json();
    },

    async recordAnswer(userId: number, learningItemId: number, correct: boolean): Promise<void> {
        const params = new URLSearchParams({
            userId: String(userId),
            learningItemId: String(learningItemId),
            correct: String(correct),
        });
        const response = await fetch(`${API_BASE_URL}/user-learning-status/answer?${params}`, {
            method: 'POST',
            credentials: 'include',
        });
        if (!response.ok) {
            console.error('Failed to record answer:', response.statusText);
        }
    },

    async getItemStatuses(userId: number, learningSetId: number): Promise<ItemStatusDto[]> {
        const response = await fetch(
            `${API_BASE_URL}/user-learning-status/set/${learningSetId}/user/${userId}`,
            {credentials: 'include'}
        );
        if (!response.ok) return [];
        const data = await response.json();
        return data.map((item: any) => ({
            learningItemId: item.learningItemId,
            status: item.status,
            correctAnswers: item.correctAnswers,
            totalAttempts: item.totalAttempts,
        }));
    },

    async completeFlashcards(userId: number, learningSetId: number, score: number): Promise<void> {
        const params = new URLSearchParams({
            userId: String(userId),
            learningSetId: String(learningSetId),
            score: String(score),
        });
        const response = await fetch(`${API_BASE_URL}/user-learning-sets/complete-flashcards?${params}`, {
            method: 'POST',
            credentials: 'include',
        });
        if (!response.ok) {
            console.error('Failed to complete flashcards:', response.statusText);
        }
    },

    async getFlashCards(learningSetId: number): Promise<FlashCardData[]> {
        const response = await fetch(`${API_BASE_URL}/learning-sets/${learningSetId}/flashcards`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Failed to get flash cards: ${response.statusText}`);
        }

        const items = await response.json();
        return items.map((item: any) => ({
            word: item.text,
            translation: item.translation,
            exampleSentence: item.exampleSentence,
            id: item.id
        }));
    },

    async getTestItems(learningSetId: number): Promise<TestItemData[]> {
        const response = await fetch(`${API_BASE_URL}/learning-sets/${learningSetId}/tests`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Failed to get test items: ${response.statusText}`);
        }

        const items = await response.json();
        return items.map((item: any) => ({
            id: item.id,
            question: item.text,
            answers: item.answers,
            correctAnswerIndex: item.correctAnswerIndex,
            translation: item.translation
        }));
    }
};
