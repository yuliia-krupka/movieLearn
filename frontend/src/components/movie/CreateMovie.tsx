import React, {useState} from 'react';
import {
    Form,
    Input,
    Button,
    Typography,
    Card,
    Space,
} from 'antd';
import {SaveFilled, CloseOutlined} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import {useGenres} from '../hooks/useGenres.tsx';
import {useFileUpload} from '../hooks/useFileUpload.tsx';
import {type MovieFormData, type NewGenreData} from '../../types/movie';
import GenreSelector from '../genre/GenreSelector.tsx';
import FileUploader from './FileUploader.tsx';
import AddGenreModal from '../genre/AddGenreModal.tsx';
import MainLayout from '../layout/MainLayout.tsx';
import useMessage from 'antd/es/message/useMessage';
import {ErrorHandler} from '../err/ErrorHandler.tsx';
import '../css/Layout.css';
import '../css/movies.css';
import '../css/CreateMovie.css';

const {Title} = Typography;
const {TextArea} = Input;

const CreateMovieForm: React.FC = () => {
    const [submitting, setSubmitting] = useState(false);
    const [isGenreModalVisible, setIsGenreModalVisible] = useState(false);
    const [addingGenre, setAddingGenre] = useState(false);

    const [customMessage, contextHolder] = useMessage();
    const navigate = useNavigate();
    const {genres, loading, addGenre, fetchGenres} = useGenres();
    const imageUpload = useFileUpload('Please upload a poster');
    const scriptUpload = useFileUpload('Please upload a script file');

    const [form] = Form.useForm();

    const handleAddNewGenre = async (values: NewGenreData): Promise<void> => {
        setAddingGenre(true);
        try {
            const success = await addGenre(values);
            if (success) {
                customMessage.success('Genre added successfully!');
                setIsGenreModalVisible(false);
            }
        } catch (error) {
            const message = ErrorHandler.handleAxiosError(error, `Genre "${values.name}" already exists.`);
            customMessage.error(message);
        } finally {
            setAddingGenre(false);
        }
    };


    const validateUploadedFiles = (): boolean => {
        const imageValid = imageUpload.validateFile();
        const scriptValid = scriptUpload.validateFile();
        return imageValid && scriptValid;
    };

    const createFormData = (values: MovieFormData): FormData => {
        const formData = new FormData();
        const movieData = {
            title: values.title,
            description: values.description,
            genres: values.genres,
        };
        formData.append('movieData', new Blob([JSON.stringify(movieData)], {type: 'application/json'}));
        if (imageUpload.file) {
            formData.append('image', imageUpload.file);
        }
        if (scriptUpload.file) {
            formData.append('script', scriptUpload.file);
        }
        return formData;
    };

    const submitMovieData = async (formData: FormData): Promise<void> => {
        const response = await axios.post('/api/movies', formData, {
            headers: {'Content-Type': 'multipart/form-data'},
            withCredentials: true,
        });
        customMessage.success('Movie created successfully!');
        navigate(`/movies/${response.data.id}`);
    };

    const handleSubmit = async (values: MovieFormData): Promise<void> => {
        if (!validateUploadedFiles()) return;
        setSubmitting(true);
        try {
            const formData = createFormData(values);
            await submitMovieData(formData);
        } catch (error) {
            const message = ErrorHandler.handleAxiosError(error, 'A movie with this title already exists.');
            customMessage.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = (): void => {
        navigate('/admin');
    };

    const renderLoadingState = () => (
        <MainLayout messageContext={contextHolder}>
            <div className="loading-container">
                <span>Loading genres...</span>
            </div>
        </MainLayout>
    );

    const renderFormContent = () => (
        <Card className="create-movie-card">
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item
                    label="Title"
                    name="title"
                    rules={[
                        {required: true, message: 'Please enter movie title'},
                        {min: 2, message: 'Title must be at least 2 characters'},
                        {
                            pattern: /^[A-Za-z0-9\s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]*$/,
                            message: 'Only English letters, numbers, and symbols are allowed'
                        }
                    ]}
                >
                    <Input placeholder="Enter movie title"/>
                </Form.Item>

                <Form.Item
                    label="Description"
                    name="description"
                    rules={[
                        {required: true, message: 'Please enter movie description'},
                        {min: 2, message: 'Description must be at least 2 characters'},
                        {
                            pattern: /^[A-Za-z0-9\s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]*$/,
                            message: 'Only English letters, numbers, and symbols are allowed'
                        }
                    ]}
                >
                    <TextArea rows={4} placeholder="Enter movie description"/>
                </Form.Item>

                <GenreSelector
                    genres={genres}
                    onAddGenre={() => setIsGenreModalVisible(true)}
                    onGenreUpdated={() => void fetchGenres()}
                    onGenreDeleted={() => void fetchGenres()}
                    messageApi={customMessage}
                />

                <FileUploader
                    label="Poster"
                    file={imageUpload.file}
                    previewUrl={imageUpload.previewUrl}
                    error={imageUpload.error}
                    accept="image/*"
                    onFileChange={(file) => imageUpload.handleFileChange(file, true)}
                    onFileRemove={imageUpload.handleFileRemove}
                    uploadButtonText="Upload Poster Image"
                    showPreview={true}
                />

                <FileUploader
                    label="Script"
                    file={scriptUpload.file}
                    error={scriptUpload.error}
                    accept=".pdf,.txt,.doc,.docx"
                    onFileChange={scriptUpload.handleFileChange}
                    onFileRemove={scriptUpload.handleFileRemove}
                    uploadButtonText="Upload Script File"
                />

                <Form.Item style={{textAlign: 'center', marginTop: 24}}>
                    <Space size="middle">
                        <Button
                            className="yellow-btn"
                            htmlType="submit"
                            loading={submitting}
                            icon={<SaveFilled/>}
                            size="large"
                        >
                            {submitting ? 'Creating...' : 'Create Movie'}
                        </Button>
                        <Button
                            className="blue-btn"
                            onClick={handleCancel}
                            icon={<CloseOutlined/>}
                            size="large"
                        >
                            Cancel
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );

    if (loading) {
        return renderLoadingState();
    }

    return (
        <MainLayout fullHeight messageContext={contextHolder}>
            <Title level={2} style={{textAlign: 'center'}}>Add New Movie</Title>
            {renderFormContent()}
            <AddGenreModal
                visible={isGenreModalVisible}
                loading={addingGenre}
                onCancel={() => setIsGenreModalVisible(false)}
                onSubmit={handleAddNewGenre}
            />
        </MainLayout>
    );
};

export default CreateMovieForm;