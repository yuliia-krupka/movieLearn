import {useState, useEffect} from 'react';
import {Form, message} from 'antd';
import axios from 'axios';
import {useNavigate, useParams} from "react-router-dom";
import {useGenres} from './useGenres';
import {movieService} from '../../services/movieService';

import type {Movie, FormValues} from '../../types/movie';

const useUpdateMovie = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [movie, setMovie] = useState<Movie | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [tmdbId, setTmdbId] = useState<number | null>(null);
    const [tmdbPosterPath, setTmdbPosterPath] = useState<string | null>(null);
    const [tmdbOverview, setTmdbOverview] = useState<string | null>(null);

    const navigate = useNavigate();
    const {id} = useParams<{ id: string }>();
    const [form] = Form.useForm();

    const {genres, loading: genresLoading, addGenre, deleteGenre, fetchGenres} = useGenres();

    useEffect(() => {
        let isMounted = true;
        const fetchMovie = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            try {
                const movieData = await movieService.getById(Number(id));
                if (!isMounted) return;

                setMovie(movieData);

                form.setFieldsValue({
                    title: movieData.title,
                    tmdbId: movieData.tmdbId,
                    genres: movieData.genres,
                });

                if (movieData.tmdbId) {
                    setTmdbId(movieData.tmdbId);
                    setTmdbPosterPath(movieData.posterPath || null);
                    setTmdbOverview(movieData.overview || null);
                    try {
                        const tmdbService = (await import('../../services/tmdbService')).tmdbService;
                        const getMovieImageUrl = (await import('../../services/tmdbService')).getMovieImageUrl;
                        const tmdbDetails = await tmdbService.getMovieDetails(movieData.tmdbId);
                        if (tmdbDetails && isMounted) {
                            setCurrentImageUrl(getMovieImageUrl(tmdbDetails));
                        }
                    } catch (error) {
                        console.error('Failed to fetch TMDB details for image:', error);
                    }
                }

            } catch (error) {
                if (isMounted) {
                    console.error('Error fetching movie details:', error);
                    void message.error('Error fetching movie');
                    navigate('/home');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        void fetchMovie();
        return () => {
            isMounted = false;
        };
    }, [id, form, navigate]);

    const handleSubmit = async (values: FormValues) => {
        if (!id) return;
        setSubmitting(true);

        try {
            const moviePayload = {
                title: values.title,
                tmdbId: form.getFieldValue("tmdbId") || tmdbId,
                posterPath: tmdbPosterPath,
                overview: tmdbOverview,
                genres: values.genres
            };

            await movieService.update(Number(id), moviePayload);

            void message.success('Movie updated successfully!');
            navigate(`/movies/${id}`);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const data = error.response?.data;
                const errorMessage = (data && typeof data === 'object' && 'message' in data)
                    ? (data as { message: string }).message
                    : (typeof data === 'string' ? data : 'Server error');
                void message.error(`Error updating movie: ${errorMessage}`);
            } else if (error && typeof error === 'object' && 'request' in error) {
                void message.error('Error connecting to server. Please check your internet connection.');
            } else {
                void message.error(`Error updating movie: ${(error as Error).message}`);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (form.isFieldsTouched()) {
            if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
                resetFormAndNavigate();
            }
        } else {
            resetFormAndNavigate();
        }
    };

    const resetFormAndNavigate = () => {
        form.resetFields();
        setCurrentImageUrl(null);
        navigate(`/movies/${id}`);
    };


    return {
        loading,
        submitting,
        movie,
        form,
        currentImageUrl,
        setCurrentImageUrl,
        tmdbId,
        setTmdbId,
        tmdbPosterPath,
        setTmdbPosterPath,
        tmdbOverview,
        setTmdbOverview,

        genres,
        genresLoading,
        addGenre,
        deleteGenre,
        fetchGenres,

        handleSubmit,
        handleCancel,

        id
    };
};
export default useUpdateMovie;
