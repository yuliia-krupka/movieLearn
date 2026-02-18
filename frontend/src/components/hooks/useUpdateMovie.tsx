import {useState, useEffect} from 'react';
import {Form, message} from 'antd';
import axios, {AxiosError} from 'axios';
import {useNavigate, useParams} from "react-router-dom";
import {useFileUpload} from './useFileUpload';
import {useGenres} from './useGenres';

import type {Movie, FormValues} from '../../types/movie';
import type {ApiError} from '../../types/common';

const useUpdateMovie = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [movie, setMovie] = useState<Movie | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [currentScriptInfo, setCurrentScriptInfo] = useState<{ name: string, size: string } | null>(null);

    const navigate = useNavigate();
    const {id} = useParams<{ id: string }>();
    const [form] = Form.useForm();

    const {genres, loading: genresLoading, addGenre, deleteGenre, fetchGenres} = useGenres();
    const imageUpload = useFileUpload('Please select an image file');
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
                const response = await axios.get<Movie>(`/api/movies/${id}`);
                if (!isMounted) return;

                setMovie(response.data);

                // Initialize form values ONLY when movie data is successfully fetched
                form.setFieldsValue({
                    title: response.data.title,
                    description: response.data.description,
                    genres: response.data.genres,
                });

                try {
                    const imageResponse = await axios.get(`/api/movies/${id}/image`, {
                        responseType: 'arraybuffer'
                    });
                    if (imageResponse.data && imageResponse.data.byteLength > 0 && isMounted) {
                        const blob = new Blob([imageResponse.data], {type: 'image/jpeg'});
                        const imageUrl = URL.createObjectURL(blob);
                        setCurrentImageUrl(imageUrl);
                        imageUpload.setPreviewUrl(imageUrl);
                    }
                } catch (error) {
                    if (axios.isAxiosError(error) && error.response?.status !== 404) {
                        console.error('Failed to fetch movie image:', error);
                    }
                }

                try {
                    const scriptResponse = await axios.head(`/api/movies/${id}/script`);
                    if (scriptResponse.status === 200 && isMounted) {
                        const contentLength = scriptResponse.headers['content-length'];
                        const size = contentLength ? formatFileSize(parseInt(contentLength)) : 'Unknown size';
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
    }, [id, form, navigate]); // Removed imageUpload from dependencies to prevent infinite loops/resets

    const handleSubmit = async (values: FormValues) => {
        if (!id) return;
        setSubmitting(true);

        try {
            const formData = new FormData();

            const movieData = {
                title: values.title,
                description: values.description,
                genres: values.genres
            };

            formData.append('movieData', new Blob([JSON.stringify(movieData)], {
                type: 'application/json'
            }));

            if (imageUpload.file) {
                formData.append('image', imageUpload.file);
            }

            if (scriptUpload.file) {
                formData.append('script', scriptUpload.file);
            }

            await axios.put(`/api/movies/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            void message.success('Movie updated successfully!');

            form.resetFields();
            imageUpload.handleFileRemove();
            scriptUpload.handleFileRemove();

            navigate(`/movies/${id}`);
        } catch (error: unknown) {
            const axiosError = error as AxiosError<ApiError>;
            if (axiosError.response) {
                void message.error(`Error updating movie: ${axiosError.response.data?.message || 'Server error'}`);
            } else if (axiosError.request) {
                void message.error('Error connecting to server. Please check your internet connection.');
            } else {
                void message.error(`Error updating movie: ${axiosError.message}`);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (form.isFieldsTouched() || imageUpload.file || scriptUpload.file) {
            if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
                resetFormAndNavigate();
            }
        } else {
            resetFormAndNavigate();
        }
    };

    const resetFormAndNavigate = () => {
        form.resetFields();
        imageUpload.handleFileRemove();
        scriptUpload.handleFileRemove();
        setCurrentImageUrl(null);
        setCurrentScriptInfo(null);
        navigate('/admin');
    };

    const handleImageUpload = (file: File) => {
        const isImage = file.type.startsWith('image/');
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isImage) {
            void message.error('You can only upload image files!');
            return false;
        }
        if (!isLt2M) {
            void message.error('Image must be smaller than 2MB!');
            return false;
        }
        return imageUpload.handleFileChange(file, true);
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

        genres,
        genresLoading,
        addGenre,
        deleteGenre,
        fetchGenres,
        imageUpload,
        scriptUpload,

        handleSubmit,
        handleCancel,
        handleImageUpload,
        handleScriptUpload,

        id
    };
};
export default useUpdateMovie
