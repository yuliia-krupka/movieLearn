import {api} from './apiClient';
import type {
    LearningSetDto,
    MovieProgress
} from '../types/learningSet';

// Re-export domain services for backward compatibility
export {learningItemService} from './learningItemService';
export {progressService} from './progressService';
export type {MovieProgress};

export const learningSetService = {
    async getOrCreateByMovie(movieId: number): Promise<LearningSetDto> {
        const response = await api.get(`/learning-sets/movie/${movieId}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to get learning set: ${response.statusText}`);
        }

        return response.json();
    },

    async getLatestByUserAndMovie(movieId: number, level?: string, interests?: string): Promise<LearningSetDto | null> {
        let url = `/learning-sets/movie/${movieId}/latest`;
        const params = new URLSearchParams();
        if (level) params.append('level', level);
        if (interests) params.append('interests', interests);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        const response = await api.get(url);

        if (response.status === 404) return null;
        if (!response.ok) return null;

        const data = await response.json();
        return data || null;
    },

    async getById(id: number): Promise<LearningSetDto> {
        const response = await api.get(`/learning-sets/${id}`);
        if (!response.ok) throw new Error('Failed to get learning set');
        return response.json();
    },

    async startLearningForUser(movieId: number): Promise<LearningSetDto> {
        const response = await api.post(`/learning-sets/movie/${movieId}/start`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to start learning: ${response.statusText}`);
        }
        return response.json();
    },

    async approveSet(learningSetId: number): Promise<void> {
        const response = await api.post(`/learning-sets/${learningSetId}/approve`);
        if (!response.ok) throw new Error('Failed to approve set');
    },
};
