import apiClient from './apiClient';
import type {Movie} from '../types/movie';

export interface MovieSummary {
    id: number;
    title: string;
    tmdbId: number;
}

export const movieService = {
    async getAll(): Promise<MovieSummary[]> {
        const {data} = await apiClient.get<MovieSummary[]>('/movies');
        return data;
    },

    async getById(id: number): Promise<Movie> {
        const {data} = await apiClient.get<Movie>(`/movies/${id}`);
        return data;
    },

    async fetchByEndpoint(endpoint: string, params?: Record<string, string>): Promise<Movie[]> {
        const url = endpoint.startsWith('/api') ? endpoint.replace('/api', '') : endpoint;
        const {data} = await apiClient.get<Movie[]>(url, {params});
        return data;
    },

    async search(searchQuery: string | null, selectedGenres: string[]): Promise<Movie[]> {
        const params: Record<string, string> = {};
        if (searchQuery && searchQuery.trim()) {
            params.title = searchQuery.trim();
        } else if (selectedGenres.length > 0) {
            params.genre = selectedGenres.join(',');
        }
        const {data} = await apiClient.get<Movie[]>('/movies', {params});
        return data;
    },

    async create(movieData: { movieData: Record<string, unknown>, script?: File | Blob }): Promise<Movie> {
        const formData = new FormData();
        formData.append('movieData', new Blob([JSON.stringify(movieData.movieData)], {type: 'application/json'}));
        if (movieData.script) {
            formData.append('script', movieData.script);
        }

        const {data} = await apiClient.post<Movie>('/movies', formData);
        return data;
    },

    async update(id: number, movieData: Record<string, unknown>): Promise<Movie> {
        const {data} = await apiClient.put<Movie>(`/movies/${id}`, movieData);
        return data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/movies/${id}`);
    },

    async getMoviesCount(): Promise<number> {
        const {data} = await apiClient.get<number>('/movies/count');
        return data;
    },

    async checkUserStarted(movieId: number): Promise<boolean> {
        try {
            await apiClient.get(`/user-learning-sets/movie/${movieId}`);
            return true;
        } catch {
            return false;
        }
    },
};
