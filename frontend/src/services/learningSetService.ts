import axios from 'axios';
import apiClient from './apiClient';
import type {
    LearningSetDto,
    MovieProgress
} from '../types/learningSet';

export {learningItemService} from './learningItemService';
export {progressService} from './progressService';
export type {MovieProgress};

export const learningSetService = {
    async getOrCreateByMovie(movieId: number): Promise<LearningSetDto> {
        const {data} = await apiClient.get<LearningSetDto>(`/learning-sets/movie/${movieId}`);
        return data;
    },

    async getLatestByUserAndMovie(movieId: number, level?: string, interests?: string): Promise<LearningSetDto | null> {
        const params = new URLSearchParams();
        if (level) params.append('level', level);
        if (interests) params.append('interests', interests);

        const query = params.toString();
        const url = `/learning-sets/movie/${movieId}/latest${query ? `?${query}` : ''}`;

        try {
            const {data} = await apiClient.get<LearningSetDto>(url);
            return data || null;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) return null;
            return null;
        }
    },

    async getById(id: number): Promise<LearningSetDto> {
        const {data} = await apiClient.get<LearningSetDto>(`/learning-sets/${id}`);
        return data;
    },

    async startLearningForUser(movieId: number): Promise<LearningSetDto> {
        const {data} = await apiClient.post<LearningSetDto>(`/learning-sets/movie/${movieId}/start`);
        return data;
    },

    async approveSet(learningSetId: number): Promise<void> {
        await apiClient.post(`/learning-sets/${learningSetId}/approve`);
    },
};
