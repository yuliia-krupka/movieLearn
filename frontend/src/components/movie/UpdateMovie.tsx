import React, {useState, useEffect} from 'react';
import {
    Form,
    Input,
    Button,
    Typography,
    Card,
    Space,
    Spin,

    Row,
    Col, Modal
} from 'antd';
import {SaveFilled, CloseOutlined, FileOutlined, DeleteOutlined} from '@ant-design/icons';
import useMessage from 'antd/es/message/useMessage';

import '../layout/Layout.css';
import './movies.css';
import './CreateMovie.css';
import './UpdateMovie.css';

import useUpdateMovie from '../hooks/useUpdateMovie.tsx';
import AddGenreModal from '../genre/AddGenreModal.tsx';
import FileUploader from './FileUploader.tsx';
import FormStepper from './FormStepper.tsx';
import MainLayout from "../layout/MainLayout.tsx";
import GenreSelector from "../genre/GenreSelector.tsx";

const {Title} = Typography;
const {TextArea} = Input;

const UpdateMovieForm: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<number>(0);
    const {
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
        fetchGenres,
        imageUpload,
        scriptUpload,

        handleSubmit,
        handleCancel,
        handleImageUpload,
        handleScriptUpload,

        id
    } = useUpdateMovie();

    const [messageApi, contextHolder] = useMessage();
    const [addGenreModalVisible, setAddGenreModalVisible] = useState<boolean>(false);
    const [addingGenre, setAddingGenre] = useState<boolean>(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');

    const handleAddGenre = () => {
        setAddGenreModalVisible(true);
    };

    const handleAddGenreSubmit = async (genreData: { name: string }): Promise<void> => {
        setAddingGenre(true);
        try {
            const success = await addGenre(genreData);
            if (success) {
                const currentGenres = form.getFieldValue('genres') || [];
                form.setFieldsValue({
                    genres: [...currentGenres, genreData.name]
                });
                messageApi.success('Genre added successfully');
                setAddGenreModalVisible(false);
            }
        } catch {
            messageApi.error('Failed to add genre');
        } finally {
            setAddingGenre(false);
        }
    };

    const handleGenreDeleted = () => {
        void fetchGenres();
    };

    useEffect(() => {
        if (!genresLoading && genres.length > 0) {
            const currentSelectedGenres: string[] = form.getFieldValue('genres') || [];
            if (currentSelectedGenres.length > 0) {
                const availableGenreNames = new Set(genres.map(g => g.name));
                const validSelectedGenres = currentSelectedGenres.filter(name => availableGenreNames.has(name));

                if (validSelectedGenres.length !== currentSelectedGenres.length) {
                    form.setFieldsValue({genres: validSelectedGenres});
                }
            }
        }
    }, [genres, genresLoading, form]);

    const handlePreview = (image?: string | null) => {
        const previewUrl = image || imageUpload.previewUrl;
        if (previewUrl) {
            setPreviewImage(previewUrl);
            setPreviewOpen(true);
        }
    };


    return (
        <MainLayout fullHeight>
            {contextHolder}
            <div className="update-movie-container">
                <Card className="create-movie-card-wide">
                    <div className="create-form-header">
                        <Title level={2} className="create-form-title">Update Movie</Title>
                        <div className="header-dots">
                            <div className={`header-dot ${currentStep === 0 ? 'orange' : ''}`}></div>
                            <div className={`header-dot ${currentStep === 1 ? 'orange' : ''}`}></div>
                        </div>
                    </div>
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
                                <Spin size="large" tip="Loading movie details...">
                                    <div style={{padding: 50}}/>
                                </Spin>
                            </div>
                        ) : (
                            <>
                                <FormStepper
                                    currentStep={currentStep}
                                    onStepClick={setCurrentStep}
                                    steps={['Movie Info', 'Media & Files']}
                                />

                                <div className="step-content" style={{display: currentStep === 0 ? 'block' : 'none'}}>
                                    <Form.Item
                                        name="title"
                                        label="Title"
                                        rules={[
                                            {required: true, message: 'Please enter movie title'},
                                            {min: 2, message: 'Name must be at least 2 characters'},
                                            {max: 100, message: 'Name must be at most 100 characters'},
                                        ]}
                                    >
                                        <Input placeholder="Enter movie title" showCount maxLength={100}/>
                                    </Form.Item>

                                    <Form.Item
                                        name="description"
                                        label="Description"
                                        rules={[
                                            {required: true, message: 'Please enter movie description'},
                                            {min: 2, message: 'Description must be at least 2 characters'},
                                            {max: 600, message: 'Description must be at most 600 characters'},
                                        ]}
                                    >
                                        <TextArea rows={3} placeholder="Brief summary of the movie plot..."
                                                  showCount maxLength={600}/>
                                    </Form.Item>

                                    <GenreSelector
                                        genres={genres}
                                        onAddGenre={handleAddGenre}
                                        onGenreDeleted={handleGenreDeleted}
                                        onGenreUpdated={() => void fetchGenres()}
                                        messageApi={messageApi}
                                        excludeMovieId={id ? parseInt(id) : undefined}
                                    />

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
                                                onClick={() => setCurrentStep(1)}
                                                size="large"
                                            >
                                                Next: Media &gt;
                                            </Button>
                                        </Space>
                                    </Form.Item>
                                </div>

                                <div className="step-content" style={{display: currentStep === 1 ? 'block' : 'none'}}>
                                    <Row gutter={[24, 16]}>
                                        <Col xs={24} md={12}>
                                            {!currentImageUrl ? (
                                                <FileUploader
                                                    label="Poster"
                                                    file={imageUpload.file}
                                                    previewUrl={imageUpload.previewUrl}
                                                    error={imageUpload.error}
                                                    accept="image/*"
                                                    onFileChange={handleImageUpload}
                                                    onFileRemove={imageUpload.handleFileRemove}
                                                    onPreview={() => handlePreview()}
                                                    uploadButtonText="Upload Poster"
                                                    description="JPG, PNG • max 10 MB"
                                                    iconType="image"
                                                />
                                            ) : (
                                                <Form.Item label="Poster" required>
                                                    <div className="selected-file-container">
                                                        <div
                                                            className="selected-file-icon-wrapper image clickable-preview"
                                                            onClick={() => handlePreview(currentImageUrl)}
                                                            style={{padding: 2, cursor: 'pointer'}}>
                                                            <img src={currentImageUrl} alt="Current poster" style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                                borderRadius: 4
                                                            }}/>
                                                        </div>
                                                        <div className="selected-file-info">
                                                            <p className="selected-file-name"
                                                               style={{margin: 0}}>Current Poster</p>
                                                            <p className="selected-file-size"
                                                               style={{margin: '4px 0 0 0'}}>Active</p>
                                                        </div>
                                                        <Button
                                                            type="text"
                                                            className="remove-file-icon-btn"
                                                            icon={<DeleteOutlined className="remove-icon-inner"/>}
                                                            onClick={() => {
                                                                setCurrentImageUrl(null);
                                                                imageUpload.setPreviewUrl(null);
                                                            }}
                                                        />
                                                    </div>
                                                </Form.Item>
                                            )}
                                        </Col>

                                        <Col xs={24} md={12}>
                                            {!currentScriptInfo ? (
                                                <FileUploader
                                                    label="Script"
                                                    file={scriptUpload.file}
                                                    error={scriptUpload.error}
                                                    accept=".pdf,.txt,.doc,.docx"
                                                    onFileChange={handleScriptUpload}
                                                    onFileRemove={scriptUpload.handleFileRemove}
                                                    uploadButtonText="Upload Script File"
                                                    description="PDF, TXT, DOCX • max 20 MB"
                                                    iconType="document"
                                                />
                                            ) : (
                                                <Form.Item label="Script" required>
                                                    <div className="selected-file-container">
                                                        <div className="selected-file-icon-wrapper document">
                                                            <FileOutlined className="selected-icon-inner"/>
                                                        </div>
                                                        <div className="selected-file-info">
                                                            <p className="selected-file-name"
                                                               style={{margin: 0}}>Current Script</p>
                                                            <div style={{
                                                                display: 'flex',
                                                                gap: 8,
                                                                marginTop: 4,
                                                                alignItems: 'center'
                                                            }}>
                                                                <span className="selected-file-size"
                                                                      style={{margin: 0}}>Active</span>
                                                                <Button
                                                                    type="link"
                                                                    size="small"
                                                                    style={{
                                                                        padding: 0,
                                                                        fontSize: 13,
                                                                        height: 'auto',
                                                                        lineHeight: 1
                                                                    }}
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
                                                                    Download
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="text"
                                                            className="remove-file-icon-btn"
                                                            icon={<DeleteOutlined className="remove-icon-inner"/>}
                                                            onClick={() => {
                                                                setCurrentScriptInfo(null);
                                                                scriptUpload.handleFileRemove();
                                                            }}
                                                        />
                                                    </div>
                                                </Form.Item>
                                            )}
                                        </Col>
                                    </Row>

                                    <Form.Item className="form-actions-right">
                                        <Space size="middle">
                                            <Button
                                                className="cancel-btn-light"
                                                onClick={() => setCurrentStep(0)}
                                                size="large"
                                            >
                                                &lt; Back
                                            </Button>
                                            <Button
                                                className="yellow-btn-rect"
                                                htmlType="submit"
                                                loading={submitting}
                                                icon={<SaveFilled/>}
                                                size="large"
                                            >
                                                Save Changes
                                            </Button>
                                        </Space>
                                    </Form.Item>
                                </div>
                            </>
                        )}
                    </Form>
                </Card>
            </div>

            <Modal
                open={previewOpen}
                title="Poster Preview"
                footer={null}
                onCancel={() => setPreviewOpen(false)}
                width={800}
            >
                <img alt="Poster Preview" style={{width: '100%'}} src={previewImage}/>
            </Modal>

            <AddGenreModal
                visible={addGenreModalVisible}
                loading={addingGenre}
                onCancel={() => setAddGenreModalVisible(false)}
                onSubmit={handleAddGenreSubmit}
            />
        </MainLayout>
    );
};

export default UpdateMovieForm;
