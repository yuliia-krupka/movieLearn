import {useState, useEffect} from 'react';
import {Form, message} from 'antd';
import axios from 'axios';
import {useNavigate, useParams, useLocation} from "react-router-dom";
import {useGenres} from './useGenres';
import {movieService} from '../../services/movieService';
import {useAuth} from '../auth/useAuth';

import type {Movie, FormValues} from '../../types/movie';

const useUpdateMovie = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [movie, setMovie] = useState<Movie | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);

    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [removeCurrentImage, setRemoveCurrentImage] = useState<boolean>(false);

    const navigate = useNavigate();
    const location = useLocation();
    const {id} = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const {currentUserId, isAdmin} = useAuth();

    const isAdminRoute = location.pathname.startsWith('/admin/');

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

                if (!isAdmin && movieData.creatorId !== currentUserId) {
                    void message.error('You do not have permission to edit this movie.');
                    navigate(`/movies/${id}`);
                    return;
                }

                setMovie(movieData);
                form.setFieldsValue({
                    title: movieData.title,
                    overview: movieData.overview,
                    genres: movieData.genres,
                });

                // Store existing image URL (data: URL means custom poster, otherwise abstract)
                if (movieData.image) {
                    setExistingImageUrl(movieData.image);
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
    }, [id, form, navigate, isAdmin, currentUserId]);

    const handleSubmit = async (values: FormValues) => {
        if (!id) return;
        setSubmitting(true);
        try {
            const moviePayload = {
                title: values.title,
                overview: values.overview,
                genres: values.genres,
            };

            if (removeCurrentImage && !imageFile) {
                await movieService.deleteImage(Number(id));
                await movieService.update(Number(id), moviePayload);
            } else {
                await movieService.update(Number(id), moviePayload, imageFile ?? undefined);
            }

            void message.success('Movie Card updated successfully!');
            navigate(isAdminRoute ? `/admin/movies/${id}` : `/movies/${id}`);
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
        if (form.isFieldsTouched() || imageFile || removeCurrentImage) {
            if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
                resetFormAndNavigate();
            }
        } else {
            resetFormAndNavigate();
        }
    };

    const resetFormAndNavigate = () => {
        form.resetFields();
        setImageFile(null);
        setImagePreviewUrl(null);
        setRemoveCurrentImage(false);
        navigate(isAdminRoute ? `/admin/movies` : `/movies/${id}`);
    };

    const handleImageChange = (file: File): boolean => {
        setImageFile(file);
        setRemoveCurrentImage(false);
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        return false;
    };

    const handleImageRemove = () => {
        setImageFile(null);
        setImagePreviewUrl(null);
    };

    const handleRemovePoster = () => {
        setRemoveCurrentImage(true);
        setImageFile(null);
        setImagePreviewUrl(null);
    };

    const handleRestorePoster = () => {
        setRemoveCurrentImage(false);
    };

    const hasCustomPoster = existingImageUrl?.startsWith('data:') ?? false;

    return {
        loading,
        submitting,
        movie,
        form,
        existingImageUrl,
        imageFile,
        imagePreviewUrl,
        removeCurrentImage,
        hasCustomPoster,
        handleImageChange,
        handleImageRemove,
        handleRemovePoster,
        handleRestorePoster,
        isAdminRoute,

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
