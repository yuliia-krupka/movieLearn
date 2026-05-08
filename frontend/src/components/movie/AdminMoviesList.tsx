import React, {useState} from 'react';
import {Pagination, Spin, Row, Col, Select, Empty} from 'antd';
import {useLocation} from 'react-router-dom';
import MainLayout from '../layout/MainLayout.tsx';
import AdminMovieCard from './AdminMovieCard';
import {useMovies} from '../hooks/useMovies';
import {useGenres} from '../hooks/useGenres';
import axios from 'axios';
import {movieService} from '../../services/movieService';
import {userService} from '../../services/userService';
import type {User} from '../../types/auth';
import useMessage from 'antd/es/message/useMessage';
import './AdminMoviesList.css';

const {Option} = Select;

const AdminMoviesList: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [messageApi, contextHolder] = useMessage();

    const location = useLocation();

    React.useEffect(() => {
        userService.getAll().then(setUsers).catch(console.error);
    }, []);

    const searchQuery = React.useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('search') || '';
    }, [location.search]);

    const {genres, loading: genresLoading} = useGenres();

    const emptyGenres = React.useMemo(() => [], []);

    const {movies, loading, fetchMovies} = useMovies({
        apiEndpoint: '/api/movies?size=10000',
        searchQuery: '',
        selectedGenres: emptyGenres
    });

    const filteredMovies = React.useMemo(() => {
        let result = movies;

        if (searchQuery) {
            result = result.filter(movie =>
                movie.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedGenres.length > 0) {
            result = result.filter(movie =>
                selectedGenres.some(genre => movie.genres.includes(genre))
            );
        }

        if (selectedUserId) {
            result = result.filter(movie => movie.creatorId === selectedUserId);
        }

        return result;
    }, [movies, searchQuery, selectedGenres, selectedUserId]);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedGenres, selectedUserId]);

    const handleDelete = async (id: number) => {
        try {
            await movieService.delete(id);
            void messageApi.success('Movie Card deleted successfully');
            void fetchMovies();
        } catch (error) {
            console.error('Error deleting movie card:', error);
            let errorMsg = 'Failed to delete movie card';

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

    const isLoading = loading || genresLoading;

    return (
        <MainLayout className="content-movies admin-movies-layout">
            {contextHolder}
            <div className="admin-movies-container">
                <div className="admin-movies-header">
                    <div>
                        <div className="admin-movies-title">Movie Cards List</div>
                        <div className="admin-movies-subtitle">View and manage all movie cards added by users.</div>
                    </div>
                    <div className="admin-movies-actions">
                        <Select
                            allowClear
                            showSearch
                            optionFilterProp="children"
                            placeholder="Filter by user"
                            style={{minWidth: '220px'}}
                            value={selectedUserId}
                            onChange={setSelectedUserId}
                        >
                            {users.map((user) => (
                                <Option key={user.id} value={user.id}>
                                    {user.email}
                                </Option>
                            ))}
                        </Select>
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="Filter by genre"
                            style={{minWidth: '250px'}}
                            value={selectedGenres}
                            onChange={setSelectedGenres}
                        >
                            {genres.map(({id, name}) => (
                                <Option key={id} value={name}>
                                    {name}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </div>

                {isLoading ? (
                    <div className="admin-movies-loading">
                        <Spin size="large"/>
                    </div>
                ) : filteredMovies.length === 0 ? (
                    <div style={{padding: '40px 0', textAlign: 'center'}}>
                        <Empty description={
                            searchQuery
                                ? `No movie cards found for "${searchQuery}"`
                                : selectedGenres.length > 0 || selectedUserId
                                    ? "No movie cards match the selected filters"
                                    : "No movie cards available."
                        }/>
                    </div>
                ) : (
                    <>
                        <div className="admin-movies-list-wrapper">
                            <Row gutter={[24, 24]}>
                                {paginatedMovies.map((movie) => {
                                    const creator = users.find(u => u.id === movie.creatorId);
                                    const creatorEmail = creator ? creator.email : undefined;
                                    return (
                                        <Col key={movie.id} xs={24} sm={12} md={8} lg={6}
                                             className="admin-movie-col">
                                            <AdminMovieCard
                                                movie={movie}
                                                creatorEmail={creatorEmail}
                                                onDelete={handleDelete}/>
                                        </Col>
                                    );
                                })}
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
