import React, {useState} from 'react';
import {Pagination, Spin, Row, Col} from 'antd';
import {useLocation} from 'react-router-dom';
import MainLayout from '../layout/MainLayout.tsx';
import AdminMovieCard from './AdminMovieCard';
import {useMovies} from '../hooks/useMovies';
import axios from 'axios';
import {movieService} from '../../services/movieService';
import useMessage from 'antd/es/message/useMessage';
import './AdminMoviesList.css';

const AdminMoviesList: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [messageApi, contextHolder] = useMessage();

    const location = useLocation();

    const emptyGenres = React.useMemo(() => [], []);

    const searchQuery = React.useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('search') || '';
    }, [location.search]);

    const {movies, loading, fetchMovies} = useMovies({
        apiEndpoint: '/api/movies',
        searchQuery: '',
        selectedGenres: emptyGenres
    });

    const filteredMovies = React.useMemo(() => {
        if (!searchQuery) return movies;
        return movies.filter(movie =>
            movie.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [movies, searchQuery]);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const handleDelete = async (id: number) => {
        try {
            await movieService.delete(id);
            void messageApi.success('Movie deleted successfully');
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
            void messageApi.error(errorMsg);
        }
    };


    const pageSize = 8;
    const paginatedMovies = filteredMovies.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <MainLayout className="content-movies admin-movies-layout">
            {contextHolder}
            <div className="admin-movies-container">
                <div className="admin-movies-header">
                    <div>
                        <div className="admin-movies-title">Movies List (Admin)</div>
                        <div className="admin-movies-subtitle">View and manage all movies added by users.</div>
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
                        {filteredMovies.length > 0 && (
                            <div className="admin-movies-pagination-container">
                                <Pagination
                                    current={currentPage}
                                    total={filteredMovies.length}
                                    pageSize={pageSize}
                                    onChange={setCurrentPage}
                                    showSizeChanger={false}
                                    hideOnSinglePage={true}
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
