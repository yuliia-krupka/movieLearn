import apiClient from './apiClient';
import type {Movie} from '../types/movie';

export interface MovieSummary {
    id: number;
    title: string;
    description: string;
    genres: string[];
    image: string | null;
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

    async create(formData: FormData): Promise<Movie> {
        const {data} = await apiClient.post<Movie>('/movies', formData, {
            headers: {'Content-Type': 'multipart/form-data'},
        });
        return data;
    },

    async update(id: number, formData: FormData): Promise<Movie> {
        const {data} = await apiClient.put<Movie>(`/movies/${id}`, formData, {
            headers: {'Content-Type': 'multipart/form-data'},
        });
        return data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/movies/${id}`);
    },

    async getImage(id: number): Promise<ArrayBuffer> {
        const {data} = await apiClient.get<ArrayBuffer>(`/movies/${id}/image`, {
            responseType: 'arraybuffer',
        });
        return data;
    },

    async checkScript(id: number): Promise<{ status: number; contentLength?: string }> {
        const response = await apiClient.head(`/movies/${id}/script`);
        return {
            status: response.status,
            contentLength: response.headers['content-length'],
        };
    },

    async getMoviesCount(): Promise<number> {
        const {data} = await apiClient.get<number>('/movies/count');
        return data;
    },

    async addMovieToUser(movieId: number): Promise<void> {
        await apiClient.put(`/users/movies/${movieId}`, null);
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
