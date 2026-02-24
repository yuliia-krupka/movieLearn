import React, {useState} from 'react';
import {
    Form,
    Input,
    Button,
    Typography,
    Space,
    Spin,
    Row,
    Col, Card, Modal,
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
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');

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

    const submitMovieData = async (formData: FormData) => {
        const response = await axios.post('/api/movies', formData, {
            headers: {'Content-Type': 'multipart/form-data'},
            withCredentials: true,
        });
        customMessage.success('Movie created successfully!');
        return response.data;
    };

    const handleSubmit = async (values: MovieFormData): Promise<void> => {
        if (!validateUploadedFiles()) return;
        setSubmitting(true);
        try {
            const formData = createFormData(values);
            const createdMovie = await submitMovieData(formData);
            navigate(`/movies/${createdMovie.id}`);
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

    const handlePreview = () => {
        if (imageUpload.previewUrl) {
            setPreviewImage(imageUpload.previewUrl);
            setPreviewOpen(true);
        }
    };

    const renderLoadingState = () => (
        <div className="loading-container" style={{textAlign: 'center', padding: '50px'}}>
            <Spin size="large" tip="Loading genres...">
                <div style={{padding: 50}}/>
            </Spin>
        </div>
    );

    const renderFormContent = () => (
        <Card className="create-movie-card-wide">
            <div className="create-form-header">
                <Title level={2} className="create-form-title">Add New Movie</Title>
            </div>
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
                        {max: 100, message: 'Title must be at most 100 characters'},
                        {
                            pattern: /^[A-Za-z0-9\s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]*$/,
                            message: 'Only English letters, numbers, and symbols are allowed'
                        }
                    ]}
                >
                    <Input placeholder="Enter movie title" showCount maxLength={100}/>
                </Form.Item>

                <Form.Item
                    label="Description"
                    name="description"
                    rules={[
                        {required: true, message: 'Please enter movie description'},
                        {min: 2, message: 'Description must be at least 2 characters'},
                        {max: 600, message: 'Description must be at most 600 characters'},
                        {
                            pattern: /^[A-Za-z0-9\s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]*$/,
                            message: 'Only English letters, numbers, and symbols are allowed'
                        }
                    ]}
                >
                    <TextArea rows={3} placeholder="Enter movie description" showCount maxLength={600}/>
                </Form.Item>

                <GenreSelector
                    genres={genres}
                    onAddGenre={() => setIsGenreModalVisible(true)}
                    onGenreUpdated={() => void fetchGenres()}
                    onGenreDeleted={() => void fetchGenres()}
                    messageApi={customMessage}
                />

                <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                        <FileUploader
                            label="Poster"
                            file={imageUpload.file}
                            previewUrl={imageUpload.previewUrl}
                            error={imageUpload.error}
                            accept="image/*"
                            onFileChange={(file) => imageUpload.handleFileChange(file, true)}
                            onFileRemove={imageUpload.handleFileRemove}
                            onPreview={handlePreview}
                            uploadButtonText="Upload Poster"
                            description="JPG, PNG • max 10 MB"
                            iconType="image"
                        />
                    </Col>

                    <Col xs={24} md={12}>
                        <FileUploader
                            label="Script"
                            file={scriptUpload.file}
                            error={scriptUpload.error}
                            accept=".pdf,.txt,.doc,.docx"
                            onFileChange={scriptUpload.handleFileChange}
                            onFileRemove={scriptUpload.handleFileRemove}
                            uploadButtonText="Upload Script File"
                            description="PDF, TXT, DOCX • max 20 MB"
                            iconType="document"
                        />
                    </Col>
                </Row>

                <Form.Item className="form-actions-right">
                    <Space size="middle">
                        <Button
                            className="cancel-btn-light"
                            onClick={handleCancel}
                            icon={<CloseOutlined/>}
                            size="large"
                        >
                            Cancel
                        </Button>
                        <Button
                            className="yellow-btn-rect"
                            htmlType="submit"
                            loading={submitting}
                            icon={<SaveFilled/>}
                            size="large"
                        >
                            {submitting ? 'Creating...' : 'Create Movie'}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );

    return (
        <MainLayout fullHeight>
            {contextHolder}
            {loading ? renderLoadingState() : renderFormContent()}
            <AddGenreModal
                visible={isGenreModalVisible}
                loading={addingGenre}
                onCancel={() => setIsGenreModalVisible(false)}
                onSubmit={handleAddNewGenre}
            />
            <Modal
                open={previewOpen}
                title="Poster Preview"
                footer={null}
                onCancel={() => setPreviewOpen(false)}
                width={800}
            >
                <img alt="Poster Preview" style={{width: '100%'}} src={previewImage}/>
            </Modal>
        </MainLayout>
    );
};

export default CreateMovieForm;