import apiClient from './apiClient';
import type {
    ItemStatusDto,
    MovieProgress
} from '../types/learningSet';

export const progressService = {
    async recordAnswer(learningItemId: number, correct: boolean): Promise<void> {
        try {
            await apiClient.post(`/user-learning-status/answer`, null, {
                params: {learningItemId, correct},
            });
        } catch (error) {
            console.error('Failed to record answer:', error);
        }
    },

    async recordAnswersBulk(answers: { learningItemId: number, correct: boolean }[]): Promise<void> {
        try {
            await apiClient.post(`/user-learning-status/answers/bulk`, answers);
        } catch (error) {
            console.error('Failed to record answers bulk:', error);
        }
    },

    async getItemStatuses(learningSetId: number): Promise<ItemStatusDto[]> {
        try {
            const {data} = await apiClient.get<ItemStatusDto[]>(`/user-learning-status/set/${learningSetId}`);
            return data.map((item) => ({
                learningItemId: item.learningItemId,
                status: item.status,
                correctAnswers: item.correctAnswers,
                totalAttempts: item.totalAttempts,
            }));
        } catch {
            return [];
        }
    },

    async completeFlashcards(learningSetId: number, score: number): Promise<void> {
        try {
            await apiClient.post(`/user-learning-sets/complete-flashcards`, null, {
                params: {learningSetId, score},
            });
        } catch (error) {
            console.error('Failed to complete flashcards:', error);
        }
    },

    async completeTests(learningSetId: number, score: number): Promise<void> {
        try {
            await apiClient.post(`/user-learning-sets/complete-tests`, null, {
                params: {learningSetId, score},
            });
        } catch (error) {
            console.error('Failed to complete tests:', error);
        }
    },

    async getUserProgress(): Promise<MovieProgress[]> {
        const {data: progressData} = await apiClient.get<MovieProgress[]>(`/user-learning-sets/progress`);
        return progressData.map((progress: MovieProgress) => ({
            ...progress,
            englishLevel: progress.englishLevel || 'A2'
        }));
    }
};
