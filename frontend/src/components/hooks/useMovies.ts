import {useState, useCallback, useEffect} from 'react';
import {message} from 'antd';
import {movieService} from '../../services/movieService';

import type {Movie} from '../../types/movie';

interface UseMoviesProps {
    apiEndpoint: string;
    searchQuery: string | null;
    selectedGenres: string[];
}

interface UseMoviesReturn {
    movies: Movie[];
    loading: boolean;
    error: string | null;
    fetchMovies: () => Promise<void>;
}

export const useMovies = ({apiEndpoint, searchQuery, selectedGenres}: UseMoviesProps): UseMoviesReturn => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMovies = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let data: Movie[];
            if (apiEndpoint && apiEndpoint !== '/api/movies') {
                data = await movieService.fetchByEndpoint(apiEndpoint);
            } else {
                data = await movieService.search(searchQuery, selectedGenres);
            }
            setMovies(data);
        } catch (err) {
            console.error(err);
            let errorMsg = 'Error during loading movies, try again later.';
            if (err instanceof Error) {
                errorMsg = err.message || errorMsg;
            }
            setError(errorMsg);
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, [apiEndpoint, searchQuery, selectedGenres]);

    useEffect(() => {
        void fetchMovies();
    }, [fetchMovies]);

    return {
        movies,
        loading,
        error,
        fetchMovies
    };
};
