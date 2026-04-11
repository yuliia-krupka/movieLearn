import React, {useState} from 'react';
import {
    Form,
    Input,
    Button,
    Typography,
    Row,
    Col, Card, Image as AntImage, Checkbox,
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
import TMDBSearch from './TMDBSearch.tsx';
import {type TMDBMovie, getAbstractImage, tmdbGenreIdToName} from '../../services/tmdbService';
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
    const [selectedTmdbMovie, setSelectedTmdbMovie] = useState<TMDBMovie | null>(null);

    const [customMessage, contextHolder] = useMessage();
    const navigate = useNavigate();
    const {isAdmin} = useAuth();
    const {genres, loading, addGenre, fetchGenres} = useGenres();
    const scriptUpload = useFileUpload('Please upload a script file');

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
        if (!selectedTmdbMovie) {
            void customMessage.error("Please search and select a movie from TMDB.");
            return false;
        }
        return scriptUpload.validateFile();
    };

    interface MoviePayload {
        movieData: {
            title: string;
            tmdbId: number | undefined;
            image: string;
            overview: string | undefined;
            genres: string[];
        };
        script?: File | Blob;
    }

    const createFormData = (values: MovieFormData): MoviePayload => {
        // Generate abstract image path based on TMDB id
        const imageValue = selectedTmdbMovie?.id
            ? `/abstract/abstract-${((selectedTmdbMovie.id * 7) % 10) + 1}.svg`
            : '/placeholder-movie.png';
        const movieData = {
            title: values.title,
            tmdbId: selectedTmdbMovie?.id,
            image: imageValue,
            overview: values.overview || selectedTmdbMovie?.overview,
            genres: values.genres,
        };
        const payload: MoviePayload = {movieData};
        if (scriptUpload.file) {
            payload.script = scriptUpload.file;
        }
        return payload;
    };

    const submitMovieData = async (payload: MoviePayload) => {
        const createdMovie = await movieService.create(payload);
        void customMessage.success('Movie created successfully!');
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
                <Title level={2} className="create-form-title">Add New Movie</Title>
            </div>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item label="Search Film on TMDB">
                    <TMDBSearch onSelectMovie={(movie) => {
                        setSelectedTmdbMovie(movie);
                        form.setFieldsValue({
                            title: movie.title,
                            overview: movie.overview,
                            genres: movie.genre_ids?.map(id => tmdbGenreIdToName[id]).filter(Boolean) ?? []
                        });
                    }}/>
                    {selectedTmdbMovie && (
                        <div className="tmdb-selected-info">
                            <strong>Selected:</strong> {selectedTmdbMovie.title} ({selectedTmdbMovie.release_date?.substring(0, 4)})
                        </div>
                    )}
                </Form.Item>

                <Form.Item
                    label="Title (Override if needed)"
                    name="title"
                    rules={[
                        {required: true, message: 'Please enter movie title'},
                        {min: 2, message: 'Title must be at least 2 characters'},
                        {max: 100, message: 'Title must be at most 100 characters'},
                    ]}
                >
                    <Input placeholder="Enter movie title" showCount maxLength={100}/>
                </Form.Item>

                <Form.Item
                    label="Description (Override if needed)"
                    name="overview"
                    rules={[{required: true, message: 'Please enter movie description'}]}
                >
                    <Input.TextArea
                        placeholder="Enter movie description"
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
                        {selectedTmdbMovie ? (
                            <div className="previews-container">
                                <AntImage
                                    src={getAbstractImage(selectedTmdbMovie.id)}
                                    alt="abstract preview"
                                    className="movie-preview-image"
                                    fallback="/placeholder-movie.png"
                                />
                            </div>
                        ) : (
                            <div className="movie-preview-placeholder">
                                No Preview Available
                            </div>
                        )}
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
                        I confirm that I have the right to upload this script and I agree that the data will be
                        processed
                        to generate personalized learning sets.
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