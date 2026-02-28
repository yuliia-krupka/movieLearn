import {api} from './apiClient';
import type {
    FlashCardData,
    TestItemData,
    ApiFlashCard,
    ApiTestItem,
} from '../types/learningSet';

export const learningItemService = {
    async getFlashCards(learningSetId: number): Promise<FlashCardData[]> {
        const response = await api.get(`/learning-sets/${learningSetId}/flashcards`);

        if (!response.ok) {
            throw new Error(`Failed to get flash cards: ${response.statusText}`);
        }

        const items: ApiFlashCard[] = await response.json();
        return items.map((item) => ({
            word: item.text,
            translation: item.translation,
            exampleSentence: item.exampleSentence,
            transcription: item.transcription,
            id: item.id
        }));
    },

    async getTestItems(learningSetId: number): Promise<TestItemData[]> {
        const response = await api.get(`/learning-sets/${learningSetId}/tests`);

        if (!response.ok) {
            throw new Error(`Failed to get test items: ${response.statusText}`);
        }

        const items: ApiTestItem[] = await response.json();
        return items.map((item) => ({
            id: item.id,
            text: item.text,
            question: item.text,
            answers: item.answers,
            correctAnswerIndex: item.correctAnswerIndex,
            translation: item.translation
        }));
    },

    async createItem(item: Partial<ApiFlashCard> & { learningSetId: number, type: string }): Promise<ApiFlashCard> {
        const response = await api.post(`/learning-items`, item);
        if (!response.ok) {
            const errorMsg = await response.json().then(d => d.message).catch(() => 'Failed to create item');
            throw new Error(errorMsg);
        }
        return response.json();
    },

    async updateItem(id: number, item: Partial<ApiFlashCard> & {
        learningSetId: number,
        type: string
    }): Promise<ApiFlashCard> {
        const response = await api.put(`/learning-items/${id}`, item);
        if (!response.ok) {
            const errorMsg = await response.json().then(d => d.message).catch(() => 'Failed to update item');
            throw new Error(errorMsg);
        }
        return response.json();
    },

    async deleteItem(id: number): Promise<void> {
        const response = await api.delete(`/learning-items/${id}`);
        if (!response.ok) throw new Error('Failed to delete item');
    },

    async regenerate(learningSetId: number, feedback: string, itemIds: number[]): Promise<FlashCardData[]> {
        const response = await api.post(`/learning-items/regenerate`, {learningSetId, feedback, itemIds});
        if (!response.ok) {
            const errorMsg = await response.json().then(d => d.message).catch(() => 'Failed to regenerate items');
            throw new Error(errorMsg);
        }
        const items: ApiFlashCard[] = await response.json();
        return items.map((item) => ({
            word: item.text,
            translation: item.translation,
            exampleSentence: item.exampleSentence,
            transcription: item.transcription,
            id: item.id
        }));
    },
};
