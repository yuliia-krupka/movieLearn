import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Spin, Button, Row, Col, message as antMessage} from 'antd';
import {ArrowLeftOutlined} from '@ant-design/icons';
import axios from "axios";
import MainLayout from "../layout/MainLayout.tsx";
import {useAuth} from '../auth/useAuth';
import {learningSetService} from '../../services/learningSetService';
import '../css/MovieDetails.css';
import '../css/movies.css';
import '../css/Layout.css';


interface MovieDetails {
    id: number;
    title: string;
    description: string;
    genres: string[];
    image: string | null;
}

const MovieDetails: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [movie, setMovie] = useState<MovieDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [message, contextHolder] = antMessage.useMessage();
    const {isAdmin} = useAuth();

    useEffect(() => {
        if (errorMsg) {
            void message.error(errorMsg);
            setErrorMsg(null);
        }
    }, [errorMsg, message]);

    useEffect(() => {
        if (successMsg) {
            void message.success(successMsg);
            setSuccessMsg(null);
        }
    }, [successMsg, message]);

    useEffect(() => {
        if (!id) {
            setErrorMsg('Invalid movie ID');
            navigate('/movies');
            return;
        }

        const fetchMovie = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/api/movies/${id}`, {
                    withCredentials: true,
                });
                setMovie(response.data);
            } catch {
                setErrorMsg('Error fetching movie');
                navigate('/movies');
            } finally {
                setLoading(false);
            }
        };

        fetchMovie().catch(console.error);
    }, [id, navigate]);


    const handleDelete = async () => {
        try {
            await axios.delete(`/api/movies/${id}`);
            antMessage.success('Movie deleted successfully');
            navigate('/movies');
        } catch (error: any) {
            console.error('Error deleting movie:', error);
            const errorMsg = error.response?.data?.message || error.response?.data || 'Error deleting movie';
            // If the backend returns a string directly as data
            const displayMsg = typeof error.response?.data === 'string' ? error.response.data : errorMsg;
            setErrorMsg(displayMsg);
        }
    };
    const handleStartStudying = async () => {
        try {
            setLoading(true);
            await axios.put(`/api/users/movies/${id}`, null, {
                withCredentials: true,
            });

            const set = await learningSetService.getOrCreateByMovie(Number(id));
            navigate(`/learning-sets/${set.id}/update`);
        } catch (e) {
            console.error(e);
            void message.error('Could not start studying');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Spin size="large" className="loading-spinner"/>;
    if (!movie) return null;

    const imageSource = movie.image
        ? movie.image.startsWith('data:image')
            ? movie.image
            : `data:image/jpeg;base64,${movie.image}`
        : undefined;

    return (
        <MainLayout messageContext={contextHolder}>
            <div className="movie-poster-container">
                {imageSource ? (
                    <img
                        alt="movie poster"
                        src={imageSource}
                        className="movie-poster-fullwidth"
                    />
                ) : (
                    <div className="movie-poster-placeholder">...</div>
                )}

                <div className="image-fade-bottom"/>

                <div className="movie-title-overlay">
                    <div className="movie-title-main">
                        {movie.title}
                    </div>
                </div>
            </div>

            <Row justify="center">
                <Col xs={24} sm={20} md={18} lg={16} xl={14}>
                    <div className="movie-info-container">
                        <div className="movie-genres-main">
                            {movie.genres.join(', ')}
                        </div>

                        <div className="movie-description-main">
                            {movie.description}
                        </div>

                        {!isAdmin && (
                            <div className="user-actions-container">
                                <div className="movie-actions">
                                    <Button
                                        type="link"
                                        className="back-link-btn"
                                        icon={<ArrowLeftOutlined/>}
                                        onClick={() => navigate('/movies')}
                                        style={{marginRight: '16px'}}
                                    >
                                        Back to Movies
                                    </Button>
                                    <Button
                                        className="primary-action-btn"
                                        onClick={handleStartStudying}
                                    >
                                        Start Studying
                                    </Button>
                                </div>
                            </div>
                        )}
                        {isAdmin && (
                            <div className="admin-actions-container">
                                <div className="movie-actions">
                                    <Button className="yellow-btn"
                                            onClick={() => navigate(`/admin/movies/${id}/update`)}>
                                        Edit
                                    </Button>
                                    <Button className="yellow-btn" onClick={handleDelete}>
                                        Delete
                                    </Button>
                                </div>
                                <Button
                                    type="link"
                                    className="back-link-btn"
                                    icon={<ArrowLeftOutlined/>}
                                    onClick={() => navigate('/admin/movies')}
                                >
                                    Back to List
                                </Button>
                            </div>
                        )}
                    </div>
                </Col>
            </Row>
        </MainLayout>
    );
};

export default MovieDetails;
