import React, {useState, useEffect} from 'react';
import {
    Form,
    Input,
    Button,
    Typography,
    Card,
    Space,
    Spin
} from 'antd';
import {SaveFilled, CloseOutlined} from '@ant-design/icons';
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


    return (
        <MainLayout fullHeight>
            {contextHolder}
            <div className="update-movie-container">
                <Card className="create-movie-card-wide">
                    <div className="create-form-header">
                        <Title level={2} className="create-form-title">Update Movie</Title>
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
                                    <Input placeholder="Enter movie title" showCount maxLength={100}/>
                                </Form.Item>

                                <Form.Item
                                    name="overview"
                                    label="Description (Override if needed)"
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
