import React from 'react';
import { Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import './movies.css';

const { Meta } = Card;

interface MovieCardProps {
    movie: {
        id: number;
        title: string;
        description: string;
        genres: string[];
        image: string | null;
    };
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/movies/${movie.id}`);
    };

    const imageSource = movie.image
        ? movie.image.startsWith('data:image')
            ? movie.image
            : `data:image/jpeg;base64,${movie.image}`
        : null;

    return (
        <Card
            hoverable
            className="movie-card"
            onClick={handleClick}
            style={{ cursor: 'pointer' }}
            cover={
                imageSource ? (
                    <img
                        alt={`${movie.title} cover`}
                        src={imageSource}
                        className="movie-card-cover"
                    />
                ) : (
                    <div className="movie-card-placeholder" />
                )
            }
        >
            <Meta
                title={movie.title}
                description={
                    movie.description.length > 50
                        ? `${movie.description.substring(0, 50)}...`
                        : movie.description
                }
            />
            <div className="movie-card-genres">
                {movie.genres.map((genre, index) => (
                    <span key={index} className="movie-card-genre">
                        {genre}
                        {index < movie.genres.length - 1 && ', '}
                    </span>
                ))}
            </div>
        </Card>
    );
};

export default MovieCard;
