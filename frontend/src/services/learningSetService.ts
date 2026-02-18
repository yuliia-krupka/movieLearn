import type {
    LearningSetDto,
    ItemStatusDto,
    FlashCardData,
    TestItemData,
    ApiFlashCard,
    ApiTestItem
} from '../types/learningSet';

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
        const data: ItemStatusDto[] = await response.json();
        return data.map((item) => ({
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

        const items: ApiFlashCard[] = await response.json();
        return items.map((item) => ({
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

        const items: ApiTestItem[] = await response.json();
        return items.map((item) => ({
            id: item.id,
            question: item.text,
            answers: item.answers,
            correctAnswerIndex: item.correctAnswerIndex,
            translation: item.translation
        }));
    }
};
