import {useState, useEffect} from 'react';
import {Form, message} from 'antd';
import axios from 'axios';
import {useNavigate, useParams} from "react-router-dom";
import {useGenres} from './useGenres';
import {movieService} from '../../services/movieService';

const getAbstractImageById = (id: number): string => {
    return `/abstract/abstract-${((id * 7) % 10) + 1}.svg`;
};

import type {Movie, FormValues} from '../../types/movie';

const useUpdateMovie = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [movie, setMovie] = useState<Movie | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [overview, setOverview] = useState<string | null>(null);

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
                    overview: movieData.overview,
                    genres: movieData.genres,
                });

                const abstractImageUrl = getAbstractImageById(movieData.id);
                setImage(abstractImageUrl);
                setOverview(movieData.overview || null);
                setCurrentImageUrl(abstractImageUrl);

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
                image: image || getAbstractImageById(movie?.id || 1),
                overview: values.overview || overview,
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
        image,
        setImage,
        overview,
        setOverview,

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
