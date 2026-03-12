import {useState, useEffect} from 'react';
import {Form, message} from 'antd';
import axios from 'axios';
import {useNavigate, useParams} from "react-router-dom";
import {useFileUpload} from './useFileUpload';
import {useGenres} from './useGenres';
import {movieService} from '../../services/movieService';

import type {Movie, FormValues} from '../../types/movie';

const useUpdateMovie = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [movie, setMovie] = useState<Movie | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [currentScriptInfo, setCurrentScriptInfo] = useState<{ name: string, size: string } | null>(null);
    const [tmdbId, setTmdbId] = useState<number | null>(null);

    const navigate = useNavigate();
    const {id} = useParams<{ id: string }>();
    const [form] = Form.useForm();

    const {genres, loading: genresLoading, addGenre, deleteGenre, fetchGenres} = useGenres();
    const scriptUpload = useFileUpload('Please select a script file');

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

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
                    try {
                        const tmdbService = (await import('../../services/tmdbService')).tmdbService;
                        const getImageUrl = (await import('../../services/tmdbService')).getImageUrl;
                        const tmdbDetails = await tmdbService.getMovieDetails(movieData.tmdbId);
                        if (tmdbDetails && isMounted) {
                            setCurrentImageUrl(getImageUrl(tmdbDetails.poster_path));
                        }
                    } catch (error) {
                        console.error('Failed to fetch TMDB details for image:', error);
                    }
                }

                try {
                    const scriptInfo = await movieService.checkScript(Number(id));
                    if (scriptInfo.status === 200 && isMounted) {
                        const size = scriptInfo.contentLength ? formatFileSize(parseInt(scriptInfo.contentLength)) : 'Unknown size';
                        setCurrentScriptInfo({
                            name: `script_${id}.pdf`,
                            size: size
                        });
                    }
                } catch (error) {
                    if (axios.isAxiosError(error) && error.response?.status !== 404) {
                        console.error('Failed to fetch movie script:', error);
                    }
                }

            } catch (error) {
                if (isMounted) {
                    console.error('Error fetching movie details:', error);
                    void message.error('Error fetching movie');
                    navigate('/admin');
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
            const movieData = {
                title: values.title,
                tmdbId: form.getFieldValue("tmdbId") || tmdbId,
                genres: values.genres
            };

            interface MoviePayload {
                movieData: Record<string, unknown>;
                script?: File;
            }

            const payload: MoviePayload = {movieData};

            if (scriptUpload.file) {
                payload.script = scriptUpload.file;
            } else if (currentScriptInfo === null) {
                payload.script = new File([], "empty", {type: "application/octet-stream"});
            }

            await movieService.update(Number(id), payload);

            void message.success('Movie updated successfully!');

            form.resetFields();
            scriptUpload.handleFileRemove();

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
        if (form.isFieldsTouched() || scriptUpload.file) {
            if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
                resetFormAndNavigate();
            }
        } else {
            resetFormAndNavigate();
        }
    };

    const resetFormAndNavigate = () => {
        form.resetFields();
        scriptUpload.handleFileRemove();
        setCurrentImageUrl(null);
        setCurrentScriptInfo(null);
        navigate(`/movies/${id}`);
    };


    const handleScriptUpload = (file: File) => {
        const isPdf = file.type === 'application/pdf';
        const isDoc = file.type === 'application/msword' ||
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        const isText = file.type === 'text/plain';
        const isLt5M = file.size / 1024 / 1024 < 5;

        if (!isPdf && !isDoc && !isText) {
            void message.error('You can only upload PDF, DOC, DOCX or TXT files!');
            return false;
        }
        if (!isLt5M) {
            void message.error('Script must be smaller than 5MB!');
            return false;
        }
        setCurrentScriptInfo(null);
        return scriptUpload.handleFileChange(file, false);
    };

    return {
        loading,
        submitting,
        movie,
        form,
        currentImageUrl,
        currentScriptInfo,
        setCurrentImageUrl,
        setCurrentScriptInfo,
        tmdbId,
        setTmdbId,

        genres,
        genresLoading,
        addGenre,
        deleteGenre,
        fetchGenres,
        scriptUpload,

        handleSubmit,
        handleCancel,
        handleScriptUpload,

        id
    };
};
export default useUpdateMovie
