import React, {useEffect, useState} from 'react';
import {Card, Tag, Progress} from 'antd';
import {CheckCircleOutlined, TrophyOutlined, BookOutlined} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import {tmdbService, getImageUrl, type TMDBMovie} from '../../services/tmdbService';
import type {MovieProgress} from '../../types/learningSet';

interface StatMovieCardProps {
    item: MovieProgress;
}

const StatMovieCard: React.FC<StatMovieCardProps> = ({item}) => {
    const navigate = useNavigate();
    const [tmdbMovie, setTmdbMovie] = useState<TMDBMovie | null>(null);

    useEffect(() => {
        if (item.tmdbId) {
            tmdbService.getMovieDetails(item.tmdbId)
                .then(setTmdbMovie)
                .catch(err => console.error('Error fetching TMDB for stat:', err));
        }
    }, [item.tmdbId]);

    const imageSource = tmdbMovie ? getImageUrl(tmdbMovie.poster_path) : null;

    return (
        <Card
            hoverable
            className="movie-stat-card"
            cover={
                imageSource ? (
                    <img
                        alt={item.movieTitle}
                        src={imageSource}
                        className="movie-card-img"
                    />
                ) : (
                    <div className="movie-placeholder-img">
                        <BookOutlined className="movie-placeholder-icon"/>
                    </div>
                )
            }
            onClick={() => navigate(`/movies/${item.movieId}`)}
        >
            <div className="movie-card-content">
                <div className="movie-title-section">
                    <h3>{item.movieTitle}</h3>
                    <div className="title-tags">
                        <Tag color="blue" className="english-level-tag">
                            {item.englishLevel || 'A2'}
                        </Tag>
                        <Tag color="blue" className="genre-tag">
                            Total attempts: {item.totalAttempts}
                        </Tag>
                    </div>
                </div>

                <div className="stat-section">
                    <div className="stat-label">
                        <span>Words Learned</span>
                        <span>{item.learnedWords}/{item.totalWords}</span>
                    </div>
                    <Progress
                        percent={Math.round((item.learnedWords / (item.totalWords || 1)) * 100)}
                        size="small"
                        strokeColor="#F49E4C"
                    />
                </div>

                <div className="stat-badges">
                    <div className="stat-badges-row">
                        <Tag className={item.flashcardsScore > 0 ? "flashcards-tag-active" : ""}
                             color={item.flashcardsScore > 0 ? undefined : "orange"}
                             icon={<CheckCircleOutlined/>}>
                            Flashcards: {item.flashcardsScore > 0 ? `${item.flashcardsScore}%` : "Started"}
                        </Tag>
                        <Tag color={item.testsScore > 0 ? "blue" : "default"}
                             icon={<TrophyOutlined/>}>
                            Test: {item.testsScore > 0 ? `${item.testsScore}%` : "0%"}
                        </Tag>
                    </div>
                    {item.lastAttemptAt && (
                        <div className="last-activity">
                            <span>Last attempt:</span>
                            <span> {new Date(item.lastAttemptAt).toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default StatMovieCard;
