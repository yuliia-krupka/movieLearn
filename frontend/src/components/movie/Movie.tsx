import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Spin, Button, Layout, Row, Col, message as antMessage} from 'antd';
import axios from "axios";
import Sidebar from "../layout/sidebar/Sidebar.tsx";
import TopBar from "../layout/topbar/TopBar.tsx";
import './movies.css';
import '../layout/Layout.css';

const {Content} = Layout;

interface Movie {
    id: number;
    title: string;
    description: string;
    genres: string[];
    image: string | null;
}

const MovieDetails: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, contextHolder] = antMessage.useMessage();

    const handleDelete = () => {
        axios.delete(`/api/movies/${id}`)
            .then(() => navigate('/movies'))
            .catch(error => {
                console.error('Error deleting movie:', error);
                message.error('Error deleting movie');
            });
    };


    useEffect(() => {
        if (!id) {
            message.error('Invalid movie ID');
            navigate('/movies');
            return;
        }

        const fetchMovie = async () => {
            try {
                const response = await axios.get(`/api/movies/${id}`, {
                    withCredentials: true,
                });
                setMovie(response.data);
            } catch (error) {
                message.error('Error fetching movie');
                console.error('Fetch error:', error);
                navigate('/movies');
            } finally {
                setLoading(false);
            }
        };

        fetchMovie();
    }, [id, navigate, message]);

    if (loading) return <Spin size="large" className="loading-spinner"/>;
    if (!movie) return null;

    const imageSource = movie.image
        ? movie.image.startsWith('data:image')
            ? movie.image
            : `data:image/jpeg;base64,${movie.image}`
        : undefined;

    return (
        <Layout>
            <Sidebar/>
            <Layout className="account-root-layout">
                <TopBar/>
                {contextHolder}
                <Content className="content">
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

                                <div className="movie-actions">
                                    <Button className="yellow-btn">
                                        Study Vocabulary
                                    </Button>
                                    <Button className="yellow-btn">
                                        Vocabulary Test
                                    </Button>
                                </div>

                                <div className="movie-actions">
                                    <Button className="yellow-btn" onClick={() => navigate(`/movies/${id}/update`)}>
                                        Edit
                                    </Button>
                                    <Button className="yellow-btn" onClick={handleDelete}>
                                        Delete
                                    </Button>
                                </div>


                            </div>
                        </Col>
                    </Row>
                </Content>
            </Layout>
        </Layout>
    );
};

export default MovieDetails;