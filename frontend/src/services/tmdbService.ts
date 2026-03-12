import axios from 'axios';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface TMDBMovie {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    genre_ids: number[];
}

export interface TMDBSearchResult {
    page: number;
    results: TMDBMovie[];
    total_pages: number;
    total_results: number;
}

export const getImageUrl = (path: string | null, size: 'w500' | 'original' = 'w500') => {
    if (!path) return '/placeholder-movie.png'; // Make sure you have a placeholder image in public folder
    return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const tmdbService = {
    async searchMovies(query: string): Promise<TMDBMovie[]> {
        if (!query.trim()) return [];

        try {
            const {data} = await axios.get<TMDBSearchResult>(`${TMDB_BASE_URL}/search/movie`, {
                params: {
                    api_key: TMDB_API_KEY,
                    query: query,
                    language: 'en-US',
                    page: 1,
                    include_adult: false,
                },
            });
            return data.results;
        } catch (error) {
            console.error('Error searching TMDB:', error);
            return [];
        }
    },

    async getMovieDetails(tmdbId: number): Promise<TMDBMovie | null> {
        try {
            const {data} = await axios.get<TMDBMovie>(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
                params: {
                    api_key: TMDB_API_KEY,
                    language: 'en-US',
                },
            });
            return data;
        } catch (error) {
            console.error(`Error fetching TMDB details for id ${tmdbId}:`, error);
            return null;
        }
    }
};
