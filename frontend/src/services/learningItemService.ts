import apiClient from './apiClient';
import type {
    FlashCardData,
    TestItemData,
    ApiFlashCard,
    ApiTestItem,
} from '../types/learningSet';

export const learningItemService = {
    async getFlashCards(learningSetId: number): Promise<FlashCardData[]> {
        const {data: items} = await apiClient.get<ApiFlashCard[]>(`/learning-sets/${learningSetId}/flashcards`);
        return items.map((item) => ({
            word: item.text,
            translation: item.translation,
            exampleSentence: item.exampleSentence,
            transcription: item.transcription,
            id: item.id
        }));
    },

    async getTestItems(learningSetId: number): Promise<TestItemData[]> {
        const {data: items} = await apiClient.get<ApiTestItem[]>(`/learning-sets/${learningSetId}/tests`);
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
        const {data} = await apiClient.post<ApiFlashCard>(`/learning-items`, item);
        return data;
    },

    async updateItem(id: number, item: Partial<ApiFlashCard> & {
        learningSetId: number,
        type: string
    }): Promise<ApiFlashCard> {
        const {data} = await apiClient.put<ApiFlashCard>(`/learning-items/${id}`, item);
        return data;
    },

    async deleteItem(id: number): Promise<void> {
        await apiClient.delete(`/learning-items/${id}`);
    },

    async regenerate(learningSetId: number, feedback: string, itemIds: number[]): Promise<FlashCardData[]> {
        const {data: items} = await apiClient.post<ApiFlashCard[]>(`/learning-items/regenerate`, {
            learningSetId,
            feedback,
            itemIds
        });
        return items.map((item) => ({
            word: item.text,
            translation: item.translation,
            exampleSentence: item.exampleSentence,
            transcription: item.transcription,
            id: item.id
        }));
    },
};
