import React, {useState, useEffect} from 'react';
import {
    Form,
    Input,
    Select,
    Button,
    Typography,
    Card,
    Space,
    Spin,
    Layout, message as antMessage,
} from 'antd';
import {SaveFilled, CloseOutlined} from '@ant-design/icons';

import '../css/Layout.css';
import '../css/movies.css';
import '../css/UpdateMovie.css';

import axios, {AxiosError} from 'axios';
import {useNavigate, useParams} from "react-router-dom";
import {useFileUpload} from '../hooks/useFileUpload.tsx';
import {useGenres} from '../hooks/useGenres.tsx';
import AddGenreModal from '../genre/AddGenreModal.tsx';
import FileUploader from './FileUploader.tsx';
import Sidebar from "../layout/Sidebar.tsx";
import TopBar from "../layout/TopBar.tsx";
import {Content} from "antd/es/layout/layout";

const {Title} = Typography;
const {TextArea} = Input;
const {Option} = Select;

interface FormValues {
    title: string;
    description: string;
    genres: string[];
}

interface Movie {
    id: number;
    title: string;
    description: string;
    genres: string[];
    image: string | null;
}

interface ApiError {
    message?: string;
}

const UpdateMovieForm: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [movie, setMovie] = useState<Movie | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [addGenreModalVisible, setAddGenreModalVisible] = useState<boolean>(false);
    const [addingGenre, setAddingGenre] = useState<boolean>(false);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [currentScriptInfo, setCurrentScriptInfo] = useState<{ name: string, size: string } | null>(null);
    const navigate = useNavigate();
    const [message, contextHolder] = antMessage.useMessage();
    const {id} = useParams<{ id: string }>();

    const {genres, loading: genresLoading, addGenre} = useGenres();

    const imageUpload = useFileUpload('Please select an image file');
    const scriptUpload = useFileUpload('Please select a script file');

    const [form] = Form.useForm();

    useEffect(() => {
        const fetchMovie = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get<Movie>(`/api/movies/${id}`);
                setMovie(response.data);

                form.setFieldsValue({
                    title: response.data.title,
                    description: response.data.description,
                    genres: response.data.genres,
                });

                try {
                    const imageResponse = await axios.get(`/api/movies/${id}/image`, {
                        responseType: 'arraybuffer'
                    });
                    if (imageResponse.data && imageResponse.data.byteLength > 0) {
                        const blob = new Blob([imageResponse.data], {type: 'image/jpeg'});
                        const imageUrl = URL.createObjectURL(blob);
                        setCurrentImageUrl(imageUrl);
                        imageUpload.previewUrl = imageUrl;
                    }
                } catch {
                    console.log('No current poster found or error fetching poster');
                }

                try {
                    const scriptResponse = await axios.head(`/api/movies/${id}/script`);
                    if (scriptResponse.status === 200) {
                        const contentLength = scriptResponse.headers['content-length'];
                        const size = contentLength ? formatFileSize(parseInt(contentLength)) : 'Unknown size';
                        setCurrentScriptInfo({
                            name: `script_${id}.pdf`,
                            size: size
                        });
                    }
                } catch {
                    console.log('No current script found or error checking script');
                }

            } catch (error) {
                message.error('Error fetching movie');
                console.error('Fetch error:', error);
                navigate('/movies');
            } finally {
                setLoading(false);
            }
        };

        void fetchMovie();
    }, [id, navigate, form]);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

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

            message.success('Movie updated successfully!');

            form.resetFields();
            imageUpload.handleFileRemove();
            scriptUpload.handleFileRemove();

            navigate('/movies');
        } catch (error: unknown) {
            const axiosError = error as AxiosError<ApiError>;
            if (axiosError.response) {
                message.error(`Error updating movie: ${axiosError.response.data?.message || 'Server error'}`);
            } else if (axiosError.request) {
                message.error('Error connecting to server. Please check your internet connection.');
            } else {
                message.error(`Error updating movie: ${axiosError.message}`);
            }
            console.error('Error updating movie:', error);
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
        navigate('/movies');
    };

    const validateImageFile = (file: File): boolean => {
        const isImage = file.type.startsWith('image/');
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isImage) {
            message.error('You can only upload image files!');
            return false;
        }

        if (!isLt2M) {
            message.error('Image must be smaller than 2MB!');
            return false;
        }

        return true;
    };

    const validateScriptFile = (file: File): boolean => {
        const isPdf = file.type === 'application/pdf';
        const isDoc = file.type === 'application/msword' ||
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        const isText = file.type === 'text/plain';
        const isLt5M = file.size / 1024 / 1024 < 5;

        if (!isPdf && !isDoc && !isText) {
            message.error('You can only upload PDF, DOC, DOCX or TXT files!');
            return false;
        }

        if (!isLt5M) {
            message.error('Script must be smaller than 5MB!');
            return false;
        }

        return true;
    };

    const handleImageUpload = (file: File): boolean => {
        if (validateImageFile(file)) {
            return imageUpload.handleFileChange(file, true);
        }
        return false;
    };

    const handleScriptUpload = (file: File): boolean => {
        if (validateScriptFile(file)) {
            return scriptUpload.handleFileChange(file, false);
        }
        return false;
    };

    const handleAddGenre = () => {
        setAddGenreModalVisible(true);
    };

    const handleAddGenreSubmit = async (genreData: { name: string }): Promise<void> => {
        setAddingGenre(true);
        try {
            const success = await addGenre(genreData);
            if (success) {
                setAddGenreModalVisible(false);
            }
        } catch (error: unknown) {
            console.error('Error adding genre:', error);

            if (axios.isAxiosError(error)) {
                if (error.response?.status === 409) {
                    message.error(`Genre '${genreData.name}' already exists`);
                } else if (error.response?.data?.message) {
                    message.error(error.response.data.message);
                } else {
                    message.error('Failed to add genre');
                }
            } else {
                message.error('Failed to add genre');
            }
        } finally {
            setAddingGenre(false);
        }
    };

    return (
        <Layout>
            <Sidebar/>
            <Layout className="account-root-layout">
                <TopBar/>
                {contextHolder}
                <Content className='content'>
                    <Title level={2} className='update-movie-title'>
                        Update Movie
                    </Title>
                    <div className="update-movie-container">
                        <Card className="update-movie-card">
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleSubmit}
                                initialValues={{
                                    title: movie?.title || '',
                                    description: movie?.description || '',
                                    genres: movie?.genres || []
                                }}
                            >
                                {loading ? (
                                    <div className="loading-spinner">
                                        <Spin size="large"/>
                                    </div>
                                ) : (
                                    <>
                                        <Form.Item
                                            name="title"
                                            label="Movie Title"
                                            rules={[
                                                {required: true, message: 'Please enter movie title'},
                                                {min: 2, message: 'Name must be at least 2 characters'},
                                                {max: 50, message: 'Name must be at most 50 characters'},
                                            ]}
                                        >
                                            <Input placeholder="Enter movie title" className="dynamic-input"/>
                                        </Form.Item>

                                        <Form.Item
                                            name="description"
                                            label="Description"
                                            rules={[
                                                {required: true, message: 'Please enter movie description'},
                                                {min: 2, message: 'Description must be at least 2 characters'},
                                                {max: 500, message: 'Description must be at most 500 characters'},
                                            ]}
                                        >
                                            <TextArea rows={4} placeholder="Movie description"
                                                      className="dynamic-input"/>
                                        </Form.Item>

                                        <Form.Item
                                            label={
                                                <div className="genre-selector-label">
                                                    <span>Genres</span>
                                                    <Button
                                                        className='yellow-btn add-genre-btn'
                                                        size="small"
                                                        onClick={handleAddGenre}
                                                        loading={genresLoading}
                                                    >
                                                        Add Genre
                                                    </Button>
                                                </div>
                                            }
                                            name="genres"
                                            rules={[
                                                {
                                                    required: true,
                                                    type: 'array',
                                                    min: 1,
                                                    message: 'Please choose at least one genre',
                                                },
                                            ]}
                                        >
                                            <Select
                                                mode="multiple"
                                                placeholder="Select genres"
                                                style={{width: '100%'}}
                                                loading={genresLoading}
                                            >
                                                {genres.map((genre) => (
                                                    <Option key={genre.id} value={genre.name}>
                                                        {genre.name}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>

                                        <FileUploader
                                            label="Movie Poster"
                                            file={imageUpload.file}
                                            previewUrl={imageUpload.previewUrl}
                                            error={imageUpload.error}
                                            accept="image/*"
                                            onFileChange={handleImageUpload}
                                            onFileRemove={imageUpload.handleFileRemove}
                                            uploadButtonText="Upload Poster"
                                            showPreview={true}
                                        />

                                        {currentImageUrl && !imageUpload.file && (
                                            <div className="current-file-container">
                                                <div className="current-file-info">
                                                    <div className="current-file-header">
                                                        <span className="current-file-status">✓</span>
                                                        <span className="current-file-label">Current Poster</span>
                                                        <Button
                                                            size="small"
                                                            onClick={() => {
                                                                setCurrentImageUrl(null);
                                                                imageUpload.previewUrl = null;
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                    <img
                                                        src={currentImageUrl}
                                                        alt="Current movie poster"
                                                        className="current-image-preview"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <FileUploader
                                            label="Movie Script (PDF, DOC, DOCX, TXT)"
                                            file={scriptUpload.file}
                                            error={scriptUpload.error}
                                            accept=".pdf,.doc,.docx,.txt"
                                            onFileChange={handleScriptUpload}
                                            onFileRemove={scriptUpload.handleFileRemove}
                                            uploadButtonText="Upload Script"
                                            showPreview={false}
                                        />

                                        {currentScriptInfo && (
                                            <div className="current-file-container">
                                                <div className="current-file-info">
                                                    <div className="current-file-header">
                                                        <span className="current-file-status">✓</span>
                                                        <span className="current-file-label">Current Script</span>
                                                        <Button
                                                            size="small"
                                                            onClick={() => {
                                                                setCurrentScriptInfo(null);
                                                                scriptUpload.handleFileRemove();
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                    <div className="current-script-info">
                                                        <span>Script file available</span>
                                                        <Button
                                                            size="small"
                                                            type="primary"
                                                            onClick={() => {
                                                                const link = document.createElement('a');
                                                                link.href = `/api/movies/${id}/script`;
                                                                link.download = `script_${id}.pdf`;
                                                                link.target = '_blank';
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                document.body.removeChild(link);
                                                            }}
                                                        >
                                                            Download Script
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <Form.Item>
                                            <Space className="movie-actions">
                                                <Button
                                                    className="yellow-btn"
                                                    htmlType="submit"
                                                    loading={submitting}
                                                    icon={<SaveFilled/>}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    onClick={handleCancel}
                                                    icon={<CloseOutlined/>}
                                                    className="blue-btn"
                                                >
                                                    Cancel
                                                </Button>
                                            </Space>
                                        </Form.Item>
                                    </>
                                )}
                            </Form>
                        </Card>
                    </div>

                    <AddGenreModal
                        visible={addGenreModalVisible}
                        loading={addingGenre}
                        onCancel={() => setAddGenreModalVisible(false)}
                        onSubmit={handleAddGenreSubmit}
                    />

                </Content>
            </Layout>
        </Layout>
    );
};

export default UpdateMovieForm;
