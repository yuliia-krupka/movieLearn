import {api} from './apiClient';
import type {
    ItemStatusDto,
    MovieProgress
} from '../types/learningSet';

export const progressService = {
    async recordAnswer(learningItemId: number, correct: boolean): Promise<void> {
        const params = new URLSearchParams({
            learningItemId: String(learningItemId),
            correct: String(correct),
        });
        const response = await api.post(`/user-learning-status/answer?${params}`);
        if (!response.ok) {
            console.error('Failed to record answer:', response.statusText);
        }
    },

    async recordAnswersBulk(answers: { learningItemId: number, correct: boolean }[]): Promise<void> {
        const response = await api.post(`/user-learning-status/answers/bulk`, answers);
        if (!response.ok) {
            console.error('Failed to record answers bulk:', response.statusText);
        }
    },

    async getItemStatuses(learningSetId: number): Promise<ItemStatusDto[]> {
        const response = await api.get(`/user-learning-status/set/${learningSetId}`);
        if (!response.ok) return [];
        const data: ItemStatusDto[] = await response.json();
        return data.map((item) => ({
            learningItemId: item.learningItemId,
            status: item.status,
            correctAnswers: item.correctAnswers,
            totalAttempts: item.totalAttempts,
        }));
    },

    async completeFlashcards(learningSetId: number, score: number): Promise<void> {
        const params = new URLSearchParams({
            learningSetId: String(learningSetId),
            score: String(score),
        });
        const response = await api.post(`/user-learning-sets/complete-flashcards?${params}`);
        if (!response.ok) {
            console.error('Failed to complete flashcards:', response.statusText);
        }
    },

    async completeTests(learningSetId: number, score: number): Promise<void> {
        const params = new URLSearchParams({
            learningSetId: String(learningSetId),
            score: String(score),
        });
        const response = await api.post(`/user-learning-sets/complete-tests?${params}`);
        if (!response.ok) {
            console.error('Failed to complete tests:', response.statusText);
        }
    },

    async getUserProgress(): Promise<MovieProgress[]> {
        const response = await api.get(`/user-learning-sets/progress`);
        if (!response.ok) throw new Error('Failed to get user progress');

        const progressData: MovieProgress[] = await response.json();

        return progressData.map((progress: MovieProgress) => ({
            ...progress,
            englishLevel: progress.englishLevel || 'A2'
        }));
    }
};
