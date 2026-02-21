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
        <MainLayout className="content-movies"
                    contentStyle={{padding: '0 24px', height: 'calc(100vh - 90px)', overflow: 'hidden'}}>
            <div className="admin-movies-container" style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                <div className="admin-movies-header" style={{flexShrink: 0, marginTop: '24px'}}>
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
                    <div style={{textAlign: 'center', padding: '50px', flex: 1}}>
                        <Spin size="large"/>
                    </div>
                ) : (
                    <>
                        <div style={{flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: '16px'}}>
                            <Row gutter={[24, 24]}>
                                {paginatedMovies.map((movie) => (
                                    <Col key={movie.id} xs={24} sm={12} md={8} lg={6}
                                         style={{display: 'flex', justifyContent: 'center'}}>
                                        <AdminMovieCard movie={movie} onDelete={handleDelete}/>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                        {movies.length > 0 && (
                            <div style={{
                                flexShrink: 0,
                                padding: '16px 0',
                                borderTop: '1px solid #f0f0f0',
                                backgroundColor: '#fff'
                            }}>
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
