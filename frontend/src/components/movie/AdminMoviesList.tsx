import React, {useState} from 'react';
import {Button, Pagination, Spin, Row, Col, message} from 'antd';
import {PlusOutlined} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import MainLayout from '../layout/MainLayout.tsx';
import AdminMovieCard from './AdminMovieCard';
import {useMovies} from '../hooks/useMovies';
import axios from 'axios';
import '../css/AdminMoviesList.css';

const AdminMoviesList: React.FC = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);

    const emptyGenres = React.useMemo(() => [], []);

    const {movies, loading, fetchMovies} = useMovies({
        apiEndpoint: '/api/movies',
        searchQuery: '',
        selectedGenres: emptyGenres
    });

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`/api/movies/${id}`, {withCredentials: true});
            message.success('Movie deleted successfully');
            void fetchMovies(); // Refresh list
        } catch (error) {
            console.error('Error deleting movie:', error);
            message.error('Failed to delete movie');
        }
    };

    // Pagination logic
    const pageSize = 8;
    const paginatedMovies = movies.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <MainLayout className="content-movies" contentStyle={{padding: '24px'}}>
            <div className="admin-movies-container">
                <div className="admin-movies-header">
                    <div>
                        <div className="admin-movies-title">Movies List (Admin)</div>
                        <div className="admin-movies-subtitle">You can manage all available movies here!</div>
                    </div>
                    <div style={{display: 'flex', gap: '16px'}}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined/>}
                            className="add-movie-btn"
                            onClick={() => navigate('/admin/movies/new')}
                        >
                            Add new movie
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div style={{textAlign: 'center', padding: '50px'}}>
                        <Spin size="large"/>
                    </div>
                ) : (
                    <>
                        <Row gutter={[24, 24]}>
                            {paginatedMovies.map((movie) => (
                                <Col key={movie.id} xs={24} sm={12} md={8} lg={6}
                                     style={{display: 'flex', justifyContent: 'center'}}>
                                    <AdminMovieCard movie={movie} onDelete={handleDelete}/>
                                </Col>
                            ))}
                        </Row>
                        {movies.length > 0 && (
                            <Pagination
                                current={currentPage}
                                total={movies.length}
                                pageSize={pageSize}
                                onChange={setCurrentPage}
                                showSizeChanger={false}
                            />
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    );
};

export default AdminMoviesList;
