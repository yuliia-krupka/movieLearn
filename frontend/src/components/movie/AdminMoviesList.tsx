import React, {useState} from 'react';
import {Button, Pagination, Spin, Row, Col, message} from 'antd';
import {PlusOutlined} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import MainLayout from '../layout/MainLayout.tsx';
import AdminMovieCard from './AdminMovieCard';
import {useMovies} from '../hooks/useMovies';
import axios from 'axios';
import './AdminMoviesList.css';

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
            void fetchMovies();
        } catch (error) {
            console.error('Error deleting movie:', error);
            let errorMsg = 'Failed to delete movie';

            if (axios.isAxiosError(error)) {
                const responseData = error.response?.data;
                if (typeof responseData === 'string') {
                    errorMsg = responseData;
                } else if (responseData && typeof responseData === 'object' && 'message' in responseData) {
                    errorMsg = (responseData as { message: string }).message;
                }
            }
            message.error(errorMsg);
        }
    };


    const pageSize = 8;
    const paginatedMovies = movies.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <MainLayout className="content-movies admin-movies-layout">
            <div className="admin-movies-container">
                <div className="admin-movies-header">
                    <div>
                        <div className="admin-movies-title">Movies List (Admin)</div>
                        <div className="admin-movies-subtitle">You can manage all available movies here!</div>
                    </div>
                    <div className="admin-movies-actions">
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
                    <div className="admin-movies-loading">
                        <Spin size="large"/>
                    </div>
                ) : (
                    <>
                        <div className="admin-movies-list-wrapper">
                            <Row gutter={[24, 24]}>
                                {paginatedMovies.map((movie) => (
                                    <Col key={movie.id} xs={24} sm={12} md={8} lg={6}
                                         className="admin-movie-col">
                                        <AdminMovieCard movie={movie} onDelete={handleDelete}/>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                        {movies.length > 0 && (
                            <div className="admin-movies-pagination-container">
                                <Pagination
                                    current={currentPage}
                                    total={movies.length}
                                    pageSize={pageSize}
                                    onChange={setCurrentPage}
                                    showSizeChanger={false}
                                    style={{margin: 0}}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    );
};

export default AdminMoviesList;
