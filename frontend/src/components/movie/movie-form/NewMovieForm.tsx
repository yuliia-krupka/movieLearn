import React, {useState} from 'react';
import {
    Form,
    Input,
    Button,
    Typography,
    Card,
    Space,
    Layout,
} from 'antd';
import {SaveFilled, CloseOutlined} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import {useGenres} from '../../hooks/useGenres.tsx';
import {useFileUpload} from '../../hooks/useFileUpload.tsx';
import {type MovieFormData, type NewGenreData} from './types.tsx';
import GenreSelector from './GenreSelector';
import FileUploader from './FileUploader';
import AddGenreModal from './AddGenreModal';
import Sidebar from '../../layout/sidebar/Sidebar';
import TopBar from '../../layout/topbar/TopBar';
import useMessage from 'antd/es/message/useMessage';
import '../../layout/Layout.css';
import '../movies.css';

const {Title} = Typography;
const {TextArea} = Input;
const {Content} = Layout;

const CreateMovieForm: React.FC = () => {
    const [submitting, setSubmitting] = useState(false);
    const [isGenreModalVisible, setIsGenreModalVisible] = useState(false);
    const [addingGenre, setAddingGenre] = useState(false);
    const [customMessage, contextHolder] = useMessage();
    const navigate = useNavigate();

    const {genres, loading, addGenre} = useGenres();

    const imageUpload = useFileUpload('Please upload a poster');
    const scriptUpload = useFileUpload('Please upload a script file');

    const handleAddNewGenre = async (values: NewGenreData): Promise<void> => {
        setAddingGenre(true);
        const success = await addGenre(values);
        if (success) {
            setIsGenreModalVisible(false);
        }
        setAddingGenre(false);
    };

    const handleSubmit = async (values: MovieFormData): Promise<void> => {
        const imageValid = imageUpload.validateFile();
        const scriptValid = scriptUpload.validateFile();

        if (!imageValid || !scriptValid) {
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();

            const movieData = {
                title: values.title,
                description: values.description,
                genres: values.genres,
            };

            formData.append(
                'movieData',
                new Blob([JSON.stringify(movieData)], {type: 'application/json'})
            );

            if (imageUpload.file) {
                formData.append('image', imageUpload.file);
            }

            if (scriptUpload.file) {
                formData.append('script', scriptUpload.file);
            }

            const response = await axios.post('/api/movies', formData, {
                headers: {'Content-Type': 'multipart/form-data'},
                withCredentials: true,
            });

            customMessage.success('Movie created successfully!');
            navigate(`/movies/${response.data.id}`);
        } catch (err) {
            console.error('Failed to create movie:', err);
            customMessage.error('Error creating movie');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Layout className="account-root-layout">
                <Sidebar/>
                <Layout>
                    {contextHolder}
                    <TopBar/>
                    <Content className="content">
                        <div className="loading-container">
                            <span>Loading genres...</span>
                        </div>
                    </Content>
                </Layout>
            </Layout>
        );
    }

    return (
        <Layout className="account-root-layout">
            <Sidebar/>
            <Layout>
                {contextHolder}
                <TopBar/>
                <Content className="content">
                    <Title level={2}>Add Movie</Title>
                    <Card className="create-movie-card">
                        <Form layout="vertical" onFinish={handleSubmit}>
                            <Form.Item
                                label="Title"
                                name="title"
                                rules={[
                                    {required: true, message: 'Please enter movie title'},
                                    {min: 2, message: 'Title must be at least 2 characters'}
                                ]}
                            >
                                <Input/>
                            </Form.Item>

                            <Form.Item
                                label="Description"
                                name="description"
                                rules={[
                                    {required: true, message: 'Please enter movie description'},
                                    {min: 2, message: 'Description must be at least 2 characters'}
                                ]}
                            >
                                <TextArea rows={2}/>
                            </Form.Item>

                            <GenreSelector
                                genres={genres}
                                onAddGenre={() => setIsGenreModalVisible(true)}
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
                                uploadButtonText="Upload Image"
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

                            <Form.Item style={{textAlign: 'center', margin: 5}}>
                                <Space>
                                    <Button
                                        className='yellow-btn'
                                        htmlType="submit"
                                        loading={submitting}
                                        icon={<SaveFilled/>}
                                    >
                                        Create
                                    </Button>
                                    <Button
                                        className='blue-btn'
                                        onClick={() => navigate('/movies')}
                                        icon={<CloseOutlined/>}
                                    >
                                        Cancel
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Card>

                    <AddGenreModal
                        visible={isGenreModalVisible}
                        loading={addingGenre}
                        onCancel={() => setIsGenreModalVisible(false)}
                        onSubmit={handleAddNewGenre}
                    />
                </Content>
            </Layout>
        </Layout>
    );
};

export default CreateMovieForm;