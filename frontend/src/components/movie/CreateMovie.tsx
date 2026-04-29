import React, {useState} from 'react';
import {
    Form,
    Input,
    Button,
    Typography,
    Row,
    Col, Card, Checkbox,
    Spin, Space
} from 'antd';
import {SaveFilled, CloseOutlined} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import {movieService} from '../../services/movieService';
import {useGenres} from '../hooks/useGenres.tsx';
import {useFileUpload} from '../hooks/useFileUpload.tsx';
import {useAuth} from '../auth/useAuth.tsx';
import {type MovieFormData, type NewGenreData} from '../../types/movie';
import GenreSelector from '../genre/GenreSelector.tsx';
import FileUploader from './FileUploader.tsx';
import AddGenreModal from '../genre/AddGenreModal.tsx';
import MainLayout from '../layout/MainLayout.tsx';
import useMessage from 'antd/es/message/useMessage';
import {ErrorHandler} from '../err/ErrorHandler.tsx';
import '../layout/Layout.css';
import './movies.css';
import './CreateMovie.css';

const {Title} = Typography;

const CreateMovieForm: React.FC = () => {
    const [submitting, setSubmitting] = useState(false);
    const [isGenreModalVisible, setIsGenreModalVisible] = useState(false);
    const [addingGenre, setAddingGenre] = useState(false);

    const [customMessage, contextHolder] = useMessage();
    const navigate = useNavigate();
    const {isAdmin} = useAuth();
    const {genres, loading, addGenre, fetchGenres} = useGenres();
    const scriptUpload = useFileUpload('Please upload a script file');
    const imageUpload = useFileUpload('');

    const [form] = Form.useForm();

    const handleAddNewGenre = async (values: NewGenreData): Promise<void> => {
        setAddingGenre(true);
        try {
            const success = await addGenre(values);
            if (success) {
                void customMessage.success('Genre added successfully!');
                setIsGenreModalVisible(false);
            }
        } catch (error) {
            const message = ErrorHandler.handleAxiosError(error, `Genre "${values.name}" already exists.`);
            void customMessage.error(message);
        } finally {
            setAddingGenre(false);
        }
    };


    const validateUploadedFiles = (): boolean => {
        return scriptUpload.validateFile();
    };

    interface MoviePayload {
        movieData: {
            title: string;
            overview: string | undefined;
            genres: string[];
        };
        script?: File | Blob;
        image?: File | Blob;
    }

    const createFormData = (values: MovieFormData): MoviePayload => {
        const movieData = {
            title: values.title,
            overview: values.overview,
            genres: values.genres,
        };
        const payload: MoviePayload = {movieData};
        if (scriptUpload.file) {
            payload.script = scriptUpload.file;
        }
        if (imageUpload.file) {
            payload.image = imageUpload.file;
        }
        return payload;
    };

    const submitMovieData = async (payload: MoviePayload) => {
        const createdMovie = await movieService.create(payload);
        void customMessage.success('Movie Card created successfully!');
        return createdMovie;
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
            void customMessage.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = (): void => {
        if (isAdmin) {
            navigate('/admin/movies');
        } else {
            navigate('/home');
        }
    };


    const renderLoadingState = () => (
        <div className="loading-container">
            <Spin size="large" tip="Loading genres...">
                <div className="loading-inner-spacer"/>
            </Spin>
        </div>
    );

    const renderFormContent = () => (
        <Card className="create-movie-card-wide">
            <div className="create-form-header">
                <Title level={2} className="create-form-title">Create New Movie Card</Title>
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
                    ]}
                >
                    <Input placeholder="Enter movie card title" showCount maxLength={100}/>
                </Form.Item>

                <Form.Item
                    label="Description"
                    name="overview"
                    rules={[{required: true, message: 'Please enter movie card description'}]}
                >
                    <Input.TextArea
                        placeholder="Enter movie card description"
                        rows={4}
                        showCount
                        maxLength={1000}
                    />
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
                            label="Script"
                            file={scriptUpload.file}
                            error={scriptUpload.error}
                            accept=".pdf,.txt,.doc,.docx"
                            onFileChange={scriptUpload.handleFileChange}
                            onFileRemove={scriptUpload.handleFileRemove}
                            uploadButtonText="Upload Script File"
                            description="PDF, TXT, DOCX • max 20 MB"
                            iconType="document"
                            required={true}
                        />
                    </Col>
                    <Col xs={24} md={12}>
                        <FileUploader
                            label="Movie Card Poster (optional)"
                            file={imageUpload.file}
                            previewUrl={imageUpload.previewUrl}
                            accept="image/jpeg,image/png,image/webp"
                            onFileChange={(file) => imageUpload.handleFileChange(file, true)}
                            onFileRemove={imageUpload.handleFileRemove}
                            uploadButtonText="Upload Poster Image"
                            description="JPG, PNG, WEBP • max 5 MB"
                            iconType="image"
                        />
                    </Col>
                </Row>

                <Form.Item
                    name="agreement"
                    valuePropName="checked"
                    rules={[
                        {
                            validator: (_, value) =>
                                value ? Promise.resolve() : Promise.reject(new Error('You must agree to the data rules')),
                        },
                    ]}
                    className="checkbox-agreement"
                >
                    <Checkbox>
                        I confirm that I have the right to use these data and upload this script and I agree that the
                        data will be processed to generate personalized learning sets using LLM.
                    </Checkbox>
                </Form.Item>

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
        </MainLayout>
    );
};

export default CreateMovieForm;