import React, {useEffect, useState} from 'react';
import {
    Form,
    Input,
    Select,
    Button,
    Upload,
    Typography,
    Card,
    Space,
    Layout,
    Image,
} from 'antd';
import {UploadOutlined, SaveFilled, CloseOutlined, DeleteOutlined} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import '../Layout/Layout.css';
import './movies.css';
import Sidebar from "../layout/sidebar/Sidebar.tsx";
import TopBar from "../layout/topbar/TopBar.tsx";
import useMessage from "antd/es/message/useMessage";
import {Content} from 'antd/es/layout/layout';

const {Title} = Typography;
const {TextArea} = Input;
const {Option} = Select;

interface Genre {
    id: number;
    name: string;
    displayName: string;
}

interface MovieFormData {
    title: string;
    description: string;
    genres: string[];
}

const CreateMovieForm: React.FC = () => {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [scriptFile, setScriptFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [customMessage, contextHolder] = useMessage();
    const navigate = useNavigate();

    // Валідація для файлів
    const [imageError, setImageError] = useState<string | null>(null);
    const [scriptError, setScriptError] = useState<string | null>(null);

    useEffect(() => {
        const loadGenres = async () => {
            await fetchGenres();
        };
        loadGenres();
    }, []);

    const fetchGenres = async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await axios.get('/api/genres', {withCredentials: true});
            setGenres(response.data);
        } catch (err) {
            console.error('Failed to fetch genres:', err);
            customMessage.error('Error loading genres');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values: MovieFormData): Promise<void> => {
        // Перевірка файлів перед відправкою
        let valid = true;
        if (!imageFile) {
            setImageError('Please upload a poster');
            valid = false;
        } else {
            setImageError(null);
        }
        if (!scriptFile) {
            setScriptError('Please upload a script file');
            valid = false;
        } else {
            setScriptError(null);
        }

        if (!valid) {
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

            if (imageFile) {
                formData.append('image', imageFile);
            }

            if (scriptFile) {
                formData.append('script', scriptFile);
            }

            await axios.post('/api/movies', formData, {
                headers: {'Content-Type': 'multipart/form-data'},
                withCredentials: true,
            });

            customMessage.success('Movie created successfully!');
            navigate('/movies');
        } catch (err) {
            console.error('Failed to create movie:', err);
            customMessage.error('Error creating movie');
        } finally {
            setSubmitting(false);
        }
    };

    const handleImageChange = (file: File): boolean => {
        setImageFile(file);
        setImageError(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        return false;
    };

    const handleImageRemove = (): void => {
        setImageFile(null);
        setImagePreviewUrl(null);
        setImageError('Please upload a poster');
    };

    const handleScriptChange = (file: File): boolean => {
        setScriptFile(file);
        setScriptError(null);
        return false;
    };

    const handleScriptRemove = (): void => {
        setScriptFile(null);
        setScriptError('Please upload a script file');
    };

    return (
        <Layout className="account-root-layout">
            <Sidebar/>
            <Layout>
                {contextHolder}
                <TopBar/>
                <Content className="content">
                    <Title level={2}>Add Movie</Title>
                    <Card className="create-movie-card">
                        {loading ? (
                            <div className="loading-container">
                                <span>Loading genres...</span>
                            </div>
                        ) : (
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

                                <Form.Item
                                    label="Genres"
                                    name="genres"
                                    rules={[{required: true, message: 'Please select genres'}]}
                                >
                                    <Select mode="multiple" placeholder="Select genres">
                                        {genres.map((genre) => (
                                            <Option key={genre.id} value={genre.name}>
                                                {genre.displayName}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item label="Poster" required>
                                    <div className="upload-section">
                                        {!imageFile ? (
                                            <Upload
                                                beforeUpload={handleImageChange}
                                                showUploadList={false}
                                                maxCount={1}
                                                accept="image/*"
                                            >
                                                <Button icon={<UploadOutlined/>}>
                                                    Upload Image
                                                </Button>
                                            </Upload>
                                        ) : (
                                            <div className="image-preview-container">
                                                <div className="image-preview">
                                                    {imagePreviewUrl ? (
                                                        <Image
                                                            src={imagePreviewUrl}
                                                            alt="Movie poster preview"
                                                            className="preview-image"
                                                            fallback="/api/placeholder/120/160"
                                                        />
                                                    ) : (
                                                        <div className="placeholder-image">
                                                            <span>Image Preview</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="image-info">
                                                    <p className="file-name">{imageFile.name}</p>
                                                    <p className="file-size">
                                                        {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                    <Button
                                                        danger
                                                        size="small"
                                                        icon={<DeleteOutlined/>}
                                                        onClick={handleImageRemove}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {imageError && <div style={{color: 'red', marginTop: 4}}>{imageError}</div>}
                                </Form.Item>

                                <Form.Item label="Script" required>
                                    <div className="upload-section">
                                        {!scriptFile ? (
                                            <Upload
                                                beforeUpload={handleScriptChange}
                                                showUploadList={false}
                                                maxCount={1}
                                                accept=".pdf,.txt,.doc,.docx"
                                            >
                                                <Button icon={<UploadOutlined/>}>
                                                    Upload Script File
                                                </Button>
                                            </Upload>
                                        ) : (
                                            <div className="file-info-container">
                                                <div className="file-info">
                                                    <p className="file-name">{scriptFile.name}</p>
                                                    <p className="file-size">
                                                        {(scriptFile.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <Button
                                                    danger
                                                    size="small"
                                                    icon={<DeleteOutlined/>}
                                                    onClick={handleScriptRemove}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    {scriptError && <div style={{color: 'red', marginTop: 4}}>{scriptError}</div>}
                                </Form.Item>

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
                        )}
                    </Card>
                </Content>
            </Layout>
        </Layout>
    );
};

export default CreateMovieForm;
