import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Button, Row, Col, Spin, message as antMessage, Modal} from 'antd';
import {ArrowLeftOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined} from '@ant-design/icons';
import axios from "axios";
import MainLayout from "../layout/MainLayout.tsx";
import {useAuth} from '../auth/useAuth';
import {learningSetService} from '../../services/learningSetService';
import {movieService} from '../../services/movieService';
import {tmdbService, getImageUrl, type TMDBMovie} from '../../services/tmdbService';
import './MovieDetails.css';
import learningCat from '../../assets/learning-cat.png';
import './movies.css';
import '../layout/Layout.css';
import type {LearningSetDto} from "../../types/learningSet.ts";
import {type MovieDetails} from '../../types/movie';
import {ErrorHandler} from '../err/ErrorHandler.tsx';

const MovieDetails: React.FC = () => {
        const {id} = useParams<{ id: string }>();
        const navigate = useNavigate();
        const [movie, setMovie] = useState<MovieDetails | null>(null);
        const [loading, setLoading] = useState(false);
        const [isGenerating, setIsGenerating] = useState(false);
        const [learningSet, setLearningSet] = useState<LearningSetDto | null>(null);
        const [tmdbMovie, setTmdbMovie] = useState<TMDBMovie | null>(null);
        const [errorMsg, setErrorMsg] = useState<string | null>(null);
        const [successMsg, setSuccessMsg] = useState<string | null>(null);
        const [message, contextHolder] = antMessage.useMessage();
        const {currentUserId, user, isAdmin} = useAuth();

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
                    const data = await movieService.getById(Number(id));
                    setMovie(data);
                    if (data.tmdbId) {
                        const tmdbData = await tmdbService.getMovieDetails(data.tmdbId);
                        setTmdbMovie(tmdbData);
                    }
                } catch (err: unknown) {
                    if (ErrorHandler.isForbiddenError(err)) {
                        navigate('/access-denied', {replace: true});
                        return;
                    }
                    setErrorMsg('Error fetching movie');
                    navigate('/home');
                } finally {
                    setLoading(false);
                }
            };

            fetchMovie().catch(console.error);

            if (currentUserId && !isAdmin) {
                learningSetService.getLatestByUserAndMovie(Number(id))
                    .then(setLearningSet)
                    .catch(err => console.error('Error fetching learning set:', err));
            }
        }, [id, navigate, currentUserId, user, isAdmin]);

        const handleDeleteConfirm = () => {
            Modal.confirm({
                title: 'Delete Movie',
                icon: <ExclamationCircleOutlined/>,
                content: `Are you sure you want to permanently delete "${movie?.title}" and all associated flashcards?`,
                okText: 'Yes, Delete',
                okType: 'danger',
                cancelText: 'Cancel',
                onOk: async () => {
                    try {
                        await movieService.delete(Number(id));
                        antMessage.success('Movie deleted successfully');
                        navigate(isAdmin ? '/admin/movies' : '/home');
                    } catch (error) {
                        console.error('Error deleting movie:', error);
                        let errMsg = 'Error deleting movie';

                        if (axios.isAxiosError(error)) {
                            const responseData = error.response?.data;
                            if (typeof responseData === 'string') {
                                errMsg = responseData;
                            } else if (responseData && typeof responseData === 'object' && 'message' in responseData) {
                                errMsg = (responseData as { message: string }).message;
                            }
                        }
                        setErrorMsg(errMsg);
                    }
                }
            });
        };

        const handleStartStudying = async () => {
            if (!currentUserId) {
                void message.error('You must be logged in to start studying');
                return;
            }
            try {
                setIsGenerating(true);

                const readySet = await learningSetService.startLearningForUser(Number(id));
                console.log('Learning set ready:', readySet.id);

                if (readySet.status === 'REVIEW') {
                    navigate(`/learning-sets/${readySet.id}/update`);
                } else {
                    navigate(`/learning-sets/${readySet.id}/flashcards`);
                }
            } catch (e: unknown) {
                console.error('Error in handleStartStudying:', e);
                const errorMessage = ErrorHandler.handleAxiosError(e, 'Could not start studying');
                void message.error(errorMessage);
            } finally {
                setIsGenerating(false);
            }
        };

        if (loading) return (
            <MainLayout className="content">
                <div className="loading-spinner-container">
                    <Spin size="large"/>
                </div>
            </MainLayout>
        );
        if (!movie) return null;

        const hasMatchingSet = learningSet != null;

        const imageSource = tmdbMovie
            ? getImageUrl(tmdbMovie.backdrop_path || tmdbMovie.poster_path, 'original')
            : '/placeholder-movie.png';

        const descriptionText = tmdbMovie?.overview || '';

        return (
            <MainLayout>
                {contextHolder}
                {isGenerating && (
                    <div className="generating-overlay">
                        <div className="generating-content">
                            <img
                                src={learningCat}
                                alt="Generating new content..."
                                className="generating-gif"
                            />
                            <h2 className="generating-title">Generating Magic...</h2>
                            <p className="generating-text">
                                Creating personalized flashcards based on the movie script.
                            </p>
                            <Spin size="large" className="generating-spinner"/>
                        </div>
                    </div>
                )}

                <div className="movie-poster-container">
                    <img
                        alt="movie poster"
                        src={imageSource}
                        className="movie-poster-fullwidth"
                    />

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
                                {descriptionText}
                            </div>

                            <div className="user-actions-container">
                                <div className="movie-actions">
                                    <Button
                                        type="link"
                                        className="back-link-btn movie-details-back-btn"
                                        icon={<ArrowLeftOutlined/>}
                                        onClick={() => navigate(isAdmin ? '/admin/movies' : '/home')}
                                    >
                                        Back to {isAdmin ? 'List' : 'Home'}
                                    </Button>

                                    {(!isAdmin) && (
                                        <div className="movie-details-action-group">
                                            {learningSet && learningSet.status === 'READY' && (
                                                <>
                                                    <Button
                                                        className="secondary-action-btn"
                                                        onClick={() => navigate(`/learning-sets/${learningSet.id}/update`)}
                                                    >
                                                        View Flashcards
                                                    </Button>
                                                </>
                                            )}
                                            {hasMatchingSet && learningSet!.status === 'REVIEW' && (
                                                <Button
                                                    className="secondary-action-btn"
                                                    onClick={() => navigate(`/learning-sets/${learningSet!.id}/update`)}
                                                >
                                                    Refine Flashcards
                                                </Button>
                                            )}
                                            <Button
                                                className="primary-action-btn"
                                                onClick={handleStartStudying}
                                                disabled={learningSet?.status === 'REVIEW'}
                                            >
                                                {hasMatchingSet ? 'Continue Studying' : 'Start Studying'}
                                            </Button>
                                        </div>
                                    )}

                                    <div className="movie-details-action-group">
                                        {isAdmin && (
                                            <Button className="yellow-btn"
                                                    icon={<EditOutlined/>}
                                                    onClick={() => navigate(`/admin/movies/${id}/update`)}>
                                                Edit
                                            </Button>
                                        )}
                                        {(isAdmin || movie.creatorId === currentUserId) && (
                                            <Button danger type="primary" shape="circle" size="large"
                                                    icon={<DeleteOutlined/>}
                                                    title="Delete Movie"
                                                    onClick={handleDeleteConfirm}/>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </MainLayout>
        );
    }
;

export default MovieDetails;
