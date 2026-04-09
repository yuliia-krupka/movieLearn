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
    genre_ids?: number[];
}

export const tmdbGenreIdToName: Record<number, string> = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western"
};

export interface TMDBSearchResult {
    page: number;
    results: TMDBMovie[];
    total_pages: number;
    total_results: number;
}

export const getImageUrl = (path: string | null, size: 'w500' | 'original' = 'w500') => {
    if (!path) return '/placeholder-movie.png';
    return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const getMovieImageUrl = (movie: TMDBMovie | null, size: 'w500' | 'original' = 'w500') => {
    if (!movie) return '/placeholder-movie.png';
    const path = movie.backdrop_path || movie.poster_path;
    return getImageUrl(path, size);
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
