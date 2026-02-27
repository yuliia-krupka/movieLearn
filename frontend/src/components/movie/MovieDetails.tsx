import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Button, Row, Col, Spin, message as antMessage} from 'antd';
import {ArrowLeftOutlined, EditOutlined, DeleteOutlined} from '@ant-design/icons';
import axios from "axios";
import MainLayout from "../layout/MainLayout.tsx";
import {useAuth} from '../auth/useAuth';
import {learningSetService} from '../../services/learningSetService';
import '../css/MovieDetails.css';
import '../css/movies.css';
import '../css/Layout.css';
import type {LearningSetDto} from "../../types/learningSet.ts";


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
        const [isGenerating, setIsGenerating] = useState(false);
        const [isChecking, setIsChecking] = useState(false);
        const [learningSet, setLearningSet] = useState<LearningSetDto | null>(null);
        const [isUserStarted, setIsUserStarted] = useState(false);
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

            if (currentUserId && !isAdmin) {
                const interestsStr = Array.isArray(user?.interests) ? user.interests.join(',') : user?.interests;
                learningSetService.getLatestByUserAndMovie(Number(id), user?.englishLevel, interestsStr)
                    .then(setLearningSet)
                    .catch(err => console.error('Error fetching learning set:', err));

                axios.get(`/api/user-learning-sets/movie/${id}`, {withCredentials: true})
                    .then(() => setIsUserStarted(true))
                    .catch(err => {
                        if (axios.isAxiosError(err) && err.response?.status === 404) {
                            setIsUserStarted(false);
                        } else {
                            console.error('Error checking user progress:', err);
                        }
                    });
            }
        }, [id, navigate, currentUserId, user, isAdmin]);


        const handleDelete = async () => {
            try {
                await axios.delete(`/api/movies/${id}`, {withCredentials: true});
                antMessage.success('Movie deleted successfully');
                navigate('/movies');
            } catch (error) {
                console.error('Error deleting movie:', error);
                let errorMsg = 'Error deleting movie';

                if (axios.isAxiosError(error)) {
                    const responseData = error.response?.data;
                    if (typeof responseData === 'string') {
                        errorMsg = responseData;
                    } else if (responseData && typeof responseData === 'object' && 'message' in responseData) {
                        errorMsg = (responseData as { message: string }).message;
                    }
                }
                setErrorMsg(errorMsg);
            }
        };

        const handleStartStudying = async () => {
                if (!currentUserId) {
                    void message.error('You must be logged in to start studying');
                    return;
                }
                try {
                    setIsChecking(true);

                    await axios.put(`/api/users/movies/${id}`, null, {
                        withCredentials: true,
                    });

                    const interestsStr = Array.isArray(user?.interests) ? user.interests.join(',') : user?.interests;
                    console.log('Starting study session...', {
                        movieId: id,
                        userId: currentUserId,
                        level: user?.englishLevel,
                        interests: interestsStr
                    });

                    setIsGenerating(true);
                    const learningSet = await learningSetService.startLearningForUser(Number(id));
                    console.log('Learning set ready:', learningSet.id);

                    setIsUserStarted(true);

                    if (learningSet.status === 'REVIEW') {
                        navigate(`/learning-sets/${learningSet.id}/update`);
                    } else {
                        navigate(`/learning-sets/${learningSet.id}/flashcards`);
                    }
                } catch
                    (e: unknown) {
                    console.error('Error in handleStartStudying:', e);
                    const errorMessage = e instanceof Error ? e.message : 'Could not start studying';
                    void message.error(errorMessage);
                } finally {
                    setIsGenerating(false);
                    setIsChecking(false);
                }
            }
        ;

        if (loading) return (
            <MainLayout className="content">
                <div className="loading-spinner-container">
                    <Spin size="large"/>
                </div>
            </MainLayout>
        );
        if (!movie) return null;

        const imageSource = movie.image
            ? movie.image.startsWith('data:image')
                ? movie.image
                : `data:image/jpeg;base64,${movie.image}`
            : undefined;

        return (
            <MainLayout>
                {contextHolder}
                {(isGenerating || isChecking) && (
                    <div className="generating-overlay">
                        <div className="generating-content">
                            {isGenerating ? (
                                <>
                                    <img
                                        src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM21td2NsNGkybmhyZWVzcm52N2g2bXd0d3JoY3J5Zm5jNHZtNXI4cCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/XnjBmkLXUPJQwJW4pp/giphy.gif"
                                        alt="Generating new content..."
                                        className="generating-gif"
                                    />
                                    <h2 className="generating-title">Generating Magic...</h2>
                                    <p className="generating-text">
                                        Creating personalized flashcards based on the movie script.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <Spin size="large"/>
                                    <h2 className="generating-title">Checking...</h2>
                                    <p className="generating-text">
                                        Looking for existing learning sets...
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                )}

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
                                            className="back-link-btn movie-details-back-btn"
                                            icon={<ArrowLeftOutlined/>}
                                            onClick={() => navigate('/movies')}
                                        >
                                            Back to Movies
                                        </Button>
                                        <div className="movie-details-action-group">
                                            {isUserStarted && learningSet && (learningSet.status === 'READY' || learningSet.status === 'REVIEW') && (
                                                <Button
                                                    className="secondary-action-btn"
                                                    onClick={() => navigate(`/learning-sets/${learningSet.id}/update`)}
                                                >
                                                    Refine Flashcards
                                                </Button>
                                            )}
                                            <Button
                                                className="primary-action-btn"
                                                onClick={handleStartStudying}
                                            >
                                                {isUserStarted ? 'Continue Studying' : 'Start Studying'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {isAdmin && (
                                <div className="admin-actions-container">
                                    <div className="movie-actions">
                                        <Button className="yellow-btn"
                                                icon={<EditOutlined/>}
                                                onClick={() => navigate(`/admin/movies/${id}/update`)}>
                                            Edit
                                        </Button>
                                        <Button className="yellow-btn"
                                                icon={<DeleteOutlined/>}
                                                onClick={handleDelete}>
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
    }
;

export default MovieDetails;
