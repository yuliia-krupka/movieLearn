import React from 'react';
import {Card} from 'antd';
import {useNavigate} from 'react-router-dom';
import './MovieCard.css';
import './movies.css';

const {Meta} = Card;

import type {Movie} from '../../types/movie';

interface MovieCardProps {
    movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = React.memo(({movie}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/movies/${movie.id}`);
    };

    const imageSource = movie.image
        ? movie.image.startsWith('data:image')
            ? movie.image
            : `data:image/jpeg;base64,${movie.image}`
        : null;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    };

    return (
        <Card
            hoverable
            className="movie-card"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            aria-label={`${movie.title} — ${movie.genres.slice(0, 2).join(', ')}`}
            style={{cursor: 'pointer'}}
            cover={
                imageSource ? (
                    <img
                        alt={`${movie.title} cover`}
                        src={imageSource}
                        className="movie-card-cover"
                        loading="lazy"
                        width={270}
                        height={200}
                    />
                ) : (
                    <div className="movie-card-placeholder"/>
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
                {movie.genres.slice(0, 2).join(', ')}
                {movie.genres.length > 2 && ` +${movie.genres.length - 2}`}
            </div>
        </Card>
    );
});

MovieCard.displayName = 'MovieCard';

export default MovieCard;
