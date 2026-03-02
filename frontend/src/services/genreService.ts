import apiClient from './apiClient';
import type {Genre} from '../types/genre';
import type {NewGenreData} from '../types/movie';

export const genreService = {
    async getAll(): Promise<Genre[]> {
        const {data} = await apiClient.get<Genre[]>('/genres');
        return data;
    },

    async create(genreData: NewGenreData): Promise<Genre> {
        const {data} = await apiClient.post<Genre>('/genres', genreData);
        return data;
    },

    async update(id: number, data: { name: string }): Promise<void> {
        await apiClient.put(`/genres/${id}`, data);
    },

    async delete(id: number, excludeMovieId?: number): Promise<void> {
        const params = excludeMovieId ? {excludeMovieId} : {};
        await apiClient.delete(`/genres/${id}`, {params});
    },
};
