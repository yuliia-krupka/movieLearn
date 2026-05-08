import {useState, useCallback, useEffect} from 'react';
import {message} from 'antd';
import {movieService} from '../../services/movieService';

import type {Movie} from '../../types/movie';

interface UseMoviesProps {
    apiEndpoint: string;
    searchQuery: string | null;
    selectedGenres: string[];
    pageSize?: number;
}

interface UseMoviesReturn {
    movies: Movie[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    fetchMovies: () => Promise<void>;
    loadMore: () => Promise<void>;
}

export const useMovies = ({
                              apiEndpoint,
                              searchQuery,
                              selectedGenres,
                              pageSize = 20
                          }: UseMoviesProps): UseMoviesReturn => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const isCustomEndpoint = apiEndpoint && apiEndpoint !== '/api/movies';

    const fetchMovies = useCallback(async () => {
        setLoading(true);
        setError(null);
        setCurrentPage(0);
        try {
            let data: Movie[];
            if (isCustomEndpoint) {
                data = await movieService.fetchByEndpoint(apiEndpoint);
                setMovies(data);
                setHasMore(false);
            } else if (searchQuery?.trim() || selectedGenres.length > 0) {
                data = await movieService.search(searchQuery, selectedGenres);
                setMovies(data);
                setHasMore(false);
            } else {
                const page = await movieService.getAll(0, pageSize);
                setMovies(page.content);
                setHasMore(page.number + 1 < page.totalPages);
                setCurrentPage(0);
            }
        } catch (err) {
            console.error(err);
            const errorMsg = err instanceof Error ? (err.message || 'Error during loading movies') : 'Error during loading movies, try again later.';
            setError(errorMsg);
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, [apiEndpoint, searchQuery, selectedGenres, pageSize, isCustomEndpoint]);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;
        const nextPage = currentPage + 1;
        setLoading(true);
        try {
            const page = await movieService.getAll(nextPage, pageSize);
            setMovies(prev => [...prev, ...page.content]);
            setHasMore(nextPage + 1 < page.totalPages);
            setCurrentPage(nextPage);
        } catch (err) {
            console.error(err);
            message.error('Failed to load more movies.');
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore, currentPage, pageSize]);

    useEffect(() => {
        void fetchMovies();
    }, [fetchMovies]);

    return {
        movies,
        loading,
        error,
        hasMore,
        fetchMovies,
        loadMore,
    };
};
