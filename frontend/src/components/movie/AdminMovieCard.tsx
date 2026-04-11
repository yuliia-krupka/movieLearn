import React from 'react';
import {Card, Modal} from 'antd';
import {EditOutlined, DeleteOutlined, ExclamationCircleOutlined} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import type {Movie} from '../../types/movie';
import './AdminMovieCard.css';

interface AdminMovieCardProps {
    movie: Movie;
    onDelete: (id: number) => void;
}

const {confirm} = Modal;

const AdminMovieCard: React.FC<AdminMovieCardProps> = ({movie, onDelete}) => {
    const navigate = useNavigate();

    const handleEdit = () => {
        navigate(`/admin/movies/${movie.id}/update`);
    };

    const showDeleteConfirm = () => {
        confirm({
            title: 'Are you sure you want to delete this movie?',
            icon: <ExclamationCircleOutlined/>,
            content: `This will permanently delete "${movie.title}".`,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                onDelete(movie.id);
            },
        });
    };

    const imageSource = movie.image || null;

    return (
        <div className="admin-movie-card-container">
            <Card
                className="admin-movie-card"
                variant="borderless"
                onClick={() => navigate(`/movies/${movie.id}`)}
                cover={
                    <div className="admin-card-cover-wrapper">
                        {imageSource ? (
                            <img
                                alt={movie.title}
                                src={imageSource}
                            />
                        ) : (
                            <div className="admin-card-placeholder">
                                No Image
                            </div>
                        )}
                        {movie.userEnglishLevel && (
                            <div className="movie-card-level-badge">
                                {movie.userEnglishLevel}
                            </div>
                        )}
                    </div>
                }
            >
                <div className="admin-movie-info">
                    <div className="admin-movie-title" title={movie.title}>{movie.title}</div>
                    <div className="admin-movie-genre">
                        {movie.genres && movie.genres.length > 0 ? movie.genres.join(', ') : 'No genre'}
                    </div>
                    {movie.creatorId && (
                        <div className="admin-movie-creator">
                            Creator ID: {movie.creatorId}
                        </div>
                    )}
                </div>
            </Card>
            <div className="admin-card-actions">
                <button className="admin-action-btn edit" onClick={handleEdit}>
                    <EditOutlined/>
                </button>
                <button className="admin-action-btn delete" onClick={showDeleteConfirm}>
                    <DeleteOutlined/>
                </button>
            </div>
        </div>
    );
};

export default AdminMovieCard;
