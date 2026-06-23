import React, {useState, useEffect} from 'react';
import {
    Form,
    Input,
    Button,
    Typography,
    Card,
    Space,
    Spin,
    Upload
} from 'antd';
import {
    SaveFilled,
    CloseOutlined,
    DeleteOutlined,
    SwapOutlined,
    UndoOutlined
} from '@ant-design/icons';
import useMessage from 'antd/es/message/useMessage';

import '../layout/Layout.css';
import './movies.css';
import './CreateMovie.css';
import './UpdateMovie.css';

import useUpdateMovie from '../hooks/useUpdateMovie.tsx';
import AddGenreModal from '../genre/AddGenreModal.tsx';
import MainLayout from "../layout/MainLayout.tsx";
import GenreSelector from "../genre/GenreSelector.tsx";
import {ErrorHandler} from "../err/ErrorHandler.tsx";
import FileUploader from "./FileUploader.tsx";

const {Title} = Typography;

const UpdateMovieForm: React.FC = () => {
    const {
        loading,
        submitting,
        movie,
        form,
        genres,
        genresLoading,
        addGenre,
        fetchGenres,
        handleSubmit,
        handleCancel,
        existingImageUrl,
        imageFile,
        imagePreviewUrl,
        removeCurrentImage,
        hasCustomPoster,
        scriptFile,
        setScriptFile,
        handleImageChange,
        handleImageRemove,
        handleRemovePoster,
        handleRestorePoster,
        isAdminRoute,
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
                const currentGenres = form.getFieldValue('genres') || [];
                form.setFieldsValue({
                    genres: [...currentGenres, genreData.name]
                });
                void messageApi.success('Genre added successfully');
                setAddGenreModalVisible(false);
            }
        } catch (error) {
            const errorMsg = ErrorHandler.handleAxiosError(error, `Genre "${genreData.name}" already exists.`);
            void messageApi.error(errorMsg);
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

    /* ── Poster section rendering ── */
    const renderPosterSection = () => {
        // Determine what image src to show and what label to display
        let previewSrc: string;
        let previewAlt: string;
        let statusLabel: React.ReactNode;
        let actions: React.ReactNode;

        if (imageFile && imagePreviewUrl) {
            // New file picked
            previewSrc = imagePreviewUrl;
            previewAlt = 'New poster preview';
            statusLabel = (
                <span className="poster-status-label poster-status-new">
                    New: {imageFile.name}
                </span>
            );
            actions = (
                <>
                    <Upload
                        beforeUpload={handleImageChange}
                        showUploadList={false}
                        accept="image/jpeg,image/png,image/webp"
                    >
                        <button type="button" className="poster-action-btn poster-action-change">
                            <SwapOutlined/> Change
                        </button>
                    </Upload>
                    <button
                        type="button"
                        className="poster-action-btn poster-action-discard"
                        onClick={handleImageRemove}
                    >
                        <CloseOutlined/> Discard
                    </button>
                </>
            );
        } else if (removeCurrentImage) {
            // User removed custom poster — abstract will be used
            previewSrc = existingImageUrl?.startsWith('data:')
                ? (movie ? `/abstract/abstract-${((movie.id * 7) % 10 + 1)}.svg` : '/abstract/abstract-1.svg')
                : (existingImageUrl ?? '/abstract/abstract-1.svg');
            previewAlt = 'Abstract image preview';
            statusLabel = (
                <span className="poster-status-label poster-status-abstract">
                    Abstract image will be used after saving
                </span>
            );
            actions = (
                <>
                    <button
                        type="button"
                        className="poster-action-btn poster-action-restore"
                        onClick={handleRestorePoster}
                    >
                        <UndoOutlined/> Restore
                    </button>
                    <Upload
                        beforeUpload={handleImageChange}
                        showUploadList={false}
                        accept="image/jpeg,image/png,image/webp"
                    >
                        <button type="button" className="poster-action-btn poster-action-change">
                            <SwapOutlined/> Upload custom
                        </button>
                    </Upload>
                </>
            );
        } else if (hasCustomPoster && existingImageUrl) {
            // Custom uploaded poster
            previewSrc = existingImageUrl;
            previewAlt = 'Current poster';
            statusLabel = (
                <span className="poster-status-label poster-status-custom">
                    Custom poster
                </span>
            );
            actions = (
                <>
                    <Upload
                        beforeUpload={handleImageChange}
                        showUploadList={false}
                        accept="image/jpeg,image/png,image/webp"
                    >
                        <button type="button" className="poster-action-btn poster-action-change">
                            <SwapOutlined/> Change
                        </button>
                    </Upload>
                    <button
                        type="button"
                        className="poster-action-btn poster-action-remove"
                        onClick={handleRemovePoster}
                    >
                        <DeleteOutlined/> Use abstract
                    </button>
                </>
            );
        } else {
            // Abstract image is currently in use
            previewSrc = existingImageUrl ?? '/abstract/abstract-1.svg';
            previewAlt = 'Abstract poster';
            statusLabel = (
                <span className="poster-status-label poster-status-abstract">
                    Abstract poster
                </span>
            );
            actions = (
                <Upload
                    beforeUpload={handleImageChange}
                    showUploadList={false}
                    accept="image/jpeg,image/png,image/webp"
                >
                    <button type="button" className="poster-action-btn poster-action-change">
                        <SwapOutlined/> Upload custom poster
                    </button>
                </Upload>
            );
        }

        return <Form.Item
            className="centered-label-item"
            label={<span style={{width: '100%', textAlign: 'center', display: 'block'}}>Movie Card Poster</span>}
        >
            <div className="poster-card">
                <div className="poster-img-wrapper">
                    <img src={previewSrc} alt={previewAlt} className="poster-card-img"/>
                </div>
                <div className="poster-card-footer">
                    {statusLabel}
                    <div className="poster-action-bar">
                        {actions}
                    </div>
                </div>
            </div>
        </Form.Item>
    };


    return (
        <MainLayout fullHeight>
            {contextHolder}
            <div className="update-movie-container">
                <Card className="create-movie-card-wide">
                    <div className="update-form-header">
                        <Title level={2} className="create-form-title">
                            {isAdminRoute ? 'Update Movie Card' : 'Edit Movie Card'}
                        </Title>
                    </div>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{
                            title: movie?.title || '',
                            overview: movie?.overview || '',
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
                                <Form.Item
                                    name="title"
                                    label="Title"
                                    rules={[
                                        {required: true, message: 'Please enter movie title'},
                                        {min: 2, message: 'Name must be at least 2 characters'},
                                        {max: 100, message: 'Name must be at most 100 characters'},
                                    ]}
                                >
                                    <Input placeholder="Enter movie card title" showCount maxLength={100}/>
                                </Form.Item>

                                <Form.Item
                                    name="overview"
                                    label="Description"
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
                                    onAddGenre={handleAddGenre}
                                    onGenreDeleted={handleGenreDeleted}
                                    onGenreUpdated={(oldName, newName) => {
                                        void fetchGenres();
                                        const current: string[] = form.getFieldValue('genres') || [];
                                        const updated = current.map(name => name === oldName ? newName : name);
                                        form.setFieldsValue({genres: updated});
                                    }}
                                    messageApi={messageApi}
                                    excludeMovieId={id ? parseInt(id) : undefined}
                                />

                                <FileUploader
                                    label="Replace Script (optional)"
                                    file={scriptFile}
                                    accept=".pdf,.txt,.doc,.docx"
                                    onFileChange={(file) => {
                                        setScriptFile(file);
                                        return false;
                                    }}
                                    onFileRemove={() => setScriptFile(null)}
                                    uploadButtonText="Upload New Script"
                                    description="PDF, TXT, DOCX • max 20 MB. Upload to replace the current script."
                                    iconType="document"
                                    required={false}
                                />

                                {renderPosterSection()}

                                <Form.Item className="form-actions-center">
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
