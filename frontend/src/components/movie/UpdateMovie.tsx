import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Typography,
    Card,
    Space,
    Spin,

    Row,
    Col,
    Divider
} from 'antd';
import { SaveFilled, CloseOutlined } from '@ant-design/icons';
import useMessage from 'antd/es/message/useMessage';

import '../css/Layout.css';
import '../css/movies.css';
import '../css/UpdateMovie.css';

import useUpdateMovie from '../hooks/useUpdateMovie.tsx';
import AddGenreModal from '../genre/AddGenreModal.tsx';
import FileUploader from './FileUploader.tsx';
import MainLayout from "../layout/MainLayout.tsx";
import GenreSelector from "../genre/GenreSelector.tsx";

const { Title, Text } = Typography;
const { TextArea } = Input;

const UpdateMovieForm: React.FC = () => {
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

    const handleAddGenre = () => {
        setAddGenreModalVisible(true);
    };

    const handleAddGenreSubmit = async (genreData: { name: string }): Promise<void> => {
        setAddingGenre(true);
        try {
            const success = await addGenre(genreData);
            if (success) {
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
                    form.setFieldsValue({ genres: validSelectedGenres });
                }
            }
        }
    }, [genres, genresLoading, form]);


    return (
        <MainLayout fullHeight messageContext={contextHolder}>
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <Title level={2} style={{ margin: 0 }}>Update Movie</Title>
            </div>

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
                        size="large"
                    >
                        {loading ? (
                            <div className="loading-spinner">
                                <Spin size="large" tip="Loading movie details..." />
                            </div>
                        ) : (
                            <>
                                {/* Row 1: Title and Genre */}
                                <Row gutter={24}>
                                    <Col span={12}>
                                        <Form.Item
                                            name="title"
                                            label={<span className="form-label">Movie Title</span>}
                                            rules={[
                                                { required: true, message: 'Please enter movie title' },
                                                { min: 2, message: 'Name must be at least 2 characters' },
                                                { max: 50, message: 'Name must be at most 50 characters' },
                                            ]}
                                        >
                                            <Input placeholder="Enter movie title" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <GenreSelector
                                            genres={genres}
                                            onAddGenre={handleAddGenre}
                                            onGenreDeleted={handleGenreDeleted}
                                            onGenreUpdated={() => void fetchGenres()}
                                            messageApi={messageApi}
                                        />
                                    </Col>
                                </Row>

                                {/* Row 2: Description (Full Width) */}
                                <Row>
                                    <Col span={24}>
                                        <Form.Item
                                            name="description"
                                            label={<span className="form-label">Description</span>}
                                            rules={[
                                                { required: true, message: 'Please enter movie description' },
                                                { min: 2, message: 'Description must be at least 2 characters' },
                                                { max: 500, message: 'Description must be at most 500 characters' },
                                            ]}
                                        >
                                            <TextArea rows={4} placeholder="Brief summary of the movie plot..."
                                                showCount maxLength={500} />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Divider orientation="center" plain style={{ margin: '32px 0' }}>Media & Files</Divider>

                                {/* Row 3: Script (Smaller/Thinner) */}
                                <Row>
                                    <Col span={24}>
                                        <div className="file-section" style={{ marginBottom: '24px' }}>
                                            <FileUploader
                                                label="Movie Script"
                                                file={scriptUpload.file}
                                                error={scriptUpload.error}
                                                accept=".pdf,.doc,.docx,.txt"
                                                onFileChange={handleScriptUpload}
                                                onFileRemove={scriptUpload.handleFileRemove}
                                                uploadButtonText="Select Document"
                                                showPreview={false}
                                            />

                                            {currentScriptInfo && (
                                                <div className="current-file-badge">
                                                    <div className="badge-header">
                                                        <Text strong style={{ color: '#52c41a' }}>Current Script
                                                            Active</Text>
                                                        <Button
                                                            size="small"
                                                            danger
                                                            type="text"
                                                            onClick={() => {
                                                                setCurrentScriptInfo(null);
                                                                scriptUpload.handleFileRemove();
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                    <Button
                                                        type="dashed"
                                                        block
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
                                            )}
                                        </div>
                                    </Col>
                                </Row>

                                {/* Row 4: Poster (Bigger) */}
                                <Row>
                                    <Col span={24}>
                                        <div className="file-section">
                                            <FileUploader
                                                label="Movie Poster"
                                                file={imageUpload.file}
                                                previewUrl={imageUpload.previewUrl}
                                                error={imageUpload.error}
                                                accept="image/*"
                                                onFileChange={handleImageUpload}
                                                onFileRemove={imageUpload.handleFileRemove}
                                                uploadButtonText="Select Image"
                                                showPreview={true}
                                            />

                                            {currentImageUrl && !imageUpload.file && (
                                                <div className="current-file-badge">
                                                    <div className="badge-header">
                                                        <Text strong style={{ color: '#52c41a' }}>Current Poster
                                                            Active</Text>
                                                        <Button
                                                            size="small"
                                                            danger
                                                            type="text"
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
                                                        className="badge-image"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </Col>
                                </Row>

                                <Form.Item style={{ marginTop: '40px', textAlign: 'center' }}>
                                    <Space size="large">
                                        <Button
                                            onClick={handleCancel}
                                            icon={<CloseOutlined />}
                                            size="large"
                                            className="cancel-btn"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="yellow-btn save-btn"
                                            htmlType="submit"
                                            loading={submitting}
                                            icon={<SaveFilled />}
                                            size="large"
                                        >
                                            Save Changes
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

        </MainLayout>
    );
};

export default UpdateMovieForm;
