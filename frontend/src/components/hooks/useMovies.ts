import {useState, useCallback, useEffect} from 'react';
import axios from 'axios';
import {message} from 'antd';

export interface Movie {
    id: number;
    title: string;
    description: string;
    genres: string[];
    image: string;
}

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
            const params = new URLSearchParams();

            if (searchQuery && searchQuery.trim()) {
                params.append('title', searchQuery.trim());
            } else if (selectedGenres.length > 0) {
                params.append('genre', selectedGenres.join(','));
            }

            const url = params.toString() ? `${apiEndpoint}?${params.toString()}` : apiEndpoint;

            const response = await axios.get<Movie[]>(url, {withCredentials: true});
            setMovies(response.data);
        } catch (err) {
            console.error(err);
            let errorMsg = 'Error during loading movies, try again later.';
            if (axios.isAxiosError(err)) {
                errorMsg = err.response?.data?.message || err.message || errorMsg;
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
