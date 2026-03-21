import React from 'react';
import {Card} from 'antd';
import {useNavigate} from 'react-router-dom';
import {getImageUrl} from '../../services/tmdbService';
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

    const imageSource = getImageUrl(movie.posterPath || null);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    };

    const descriptionText = movie.overview || '';

    return (
        <Card
            hoverable
            className="movie-card"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            aria-label={`${movie.title} — ${movie.genres.slice(0, 2).join(', ')}`}
            cover={
                imageSource ? (
                    <img
                        alt={`${movie.title} cover`}
                        src={imageSource}
                        className="movie-card-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="movie-card-placeholder"/>
                )
            }
        >
            <Meta
                title={movie.title}
                description={
                    descriptionText.length > 50
                        ? `${descriptionText.substring(0, 50)}...`
                        : descriptionText
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
