import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Spin, Button, Row, Col, message as antMessage} from 'antd';
import axios from "axios";
import MainLayout from "../layout/MainLayout.tsx";
import {useAuth} from '../auth/useAuth';
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
    const [isAdded, setIsAdded] = useState(false);
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
            navigate('/movies');
        } catch (error) {
            console.error('Error deleting movie:', error);
            setErrorMsg('Error deleting movie');
        }
    };

    const addMovieToUser = async () => {
        if (isAdded) return;

        setLoading(true);
        try {
            await axios.put(`/api/users/movies/${id}`, null, {
                withCredentials: true,
            });
            setIsAdded(true);
            navigate("/flash-cards", {state: {movieId: Number(id)}});
        } catch (error) {
            console.error('Error adding movie:', error);
        } finally {
            setLoading(false);
        }
    };

    const goToTest = () => {
        navigate("/tests", {state: {movieId: Number(id)}});
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
                            <div className="movie-actions">
                                <Button className="yellow-btn" onClick={addMovieToUser} disabled={isAdded}>
                                    Study Vocabulary
                                </Button>
                                <Button
                                    className="yellow-btn"
                                    onClick={goToTest}
                                >
                                    Vocabulary Test
                                </Button>
                            </div>
                        )}
                        {isAdmin && (
                            <div className="movie-actions">
                                <Button className="yellow-btn" onClick={() => navigate(`/admin/movies/${id}/update`)}>
                                    Edit
                                </Button>
                                <Button className="yellow-btn" onClick={handleDelete}>
                                    Delete
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
