import apiClient from './apiClient';
import type {Movie} from '../types/movie';

export interface MovieSummary {
    id: number;
    title: string;
}

export interface MoviePage {
    content: Movie[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export const movieService = {
    async getAll(page = 0, size = 20): Promise<MoviePage> {
        const {data} = await apiClient.get<MoviePage>('/movies', {params: {page, size}});
        return data;
    },

    async getById(id: number): Promise<Movie> {
        const {data} = await apiClient.get<Movie>(`/movies/${id}`);
        return data;
    },

    async fetchByEndpoint(endpoint: string, params?: Record<string, string>): Promise<Movie[]> {
        const url = endpoint.startsWith('/api') ? endpoint.replace('/api', '') : endpoint;
        const {data} = await apiClient.get<MoviePage | Movie[]>(url, {params});
        // Handle both plain arrays (legacy) and Page responses
        if (data && typeof data === 'object' && 'content' in data) {
            return (data as MoviePage).content;
        }
        return data as Movie[];
    },

    async search(searchQuery: string | null, selectedGenres: string[]): Promise<Movie[]> {
        const params: Record<string, string | string[]> = {};
        if (searchQuery && searchQuery.trim()) {
            params.title = searchQuery.trim();
        } else if (selectedGenres.length > 0) {
            params.genre = selectedGenres;
        }
        const {data} = await apiClient.get<MoviePage>('/movies', {params});
        return data.content;
    },

    async create(movieData: {
        movieData: Record<string, unknown>,
        script?: File | Blob,
        image?: File | Blob
    }): Promise<Movie> {
        const formData = new FormData();
        formData.append('movieData', new Blob([JSON.stringify(movieData.movieData)], {type: 'application/json'}));
        if (movieData.script) {
            formData.append('script', movieData.script);
        }
        if (movieData.image) {
            formData.append('image', movieData.image);
        }

        const {data} = await apiClient.post<Movie>('/movies', formData);
        return data;
    },

    async update(id: number, movieData: Record<string, unknown>, imageFile?: File | Blob, scriptFile?: File | Blob): Promise<Movie> {
        const formData = new FormData();
        formData.append('movieData', new Blob([JSON.stringify(movieData)], {type: 'application/json'}));
        if (imageFile) {
            formData.append('image', imageFile);
        }
        if (scriptFile) {
            formData.append('script', scriptFile);
        }
        const {data} = await apiClient.put<Movie>(`/movies/${id}`, formData);
        return data;
    },

    async deleteImage(id: number): Promise<void> {
        await apiClient.delete(`/movies/${id}/image`);
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/movies/${id}`);
    },

    async getMoviesCount(): Promise<number> {
        const {data} = await apiClient.get<number>('/movies/count');
        return data;
    },

    async getTotalMoviesCount(page = 0, size = 1): Promise<number> {
        const {data} = await apiClient.get<MoviePage>('/movies', {params: {page, size}});
        return data.totalElements;
    },
};
