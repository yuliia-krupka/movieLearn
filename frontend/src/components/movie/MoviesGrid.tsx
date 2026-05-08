import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Row, Col, Typography, Pagination,
    Spin, Empty, Select, Space
} from 'antd';
import MovieCard from "./MovieCard";
import {useGenres} from '../hooks/useGenres';
import {useLocation} from 'react-router-dom';
import useMessage from 'antd/es/message/useMessage';
import './MoviesGrid.css';

const {Title} = Typography;
const {Option} = Select;

import {useMovies} from '../hooks/useMovies';

interface MoviesGridProps {
    apiEndpoint: string;
    title: string;
    emptyMessage?: string;
    showGenreFilter?: boolean;
}

const MoviesGrid: React.FC<MoviesGridProps> = ({
                                                   apiEndpoint,
                                                   title,
                                                   emptyMessage = "No movie cards available. Please check back later!",
                                                   showGenreFilter = true,
                                               }) => {
    const {genres, loading: genresLoading} = useGenres();
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const location = useLocation();
    const [messageApi, contextHolder] = useMessage();


    const searchQuery = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('search');
    }, [location.search]);

    const handleGenreChange = useCallback((values: string[]) => {
        setSelectedGenres(values);
    }, []);

    useEffect(() => {
        const state = location.state as { message?: string } | null;
        if (state?.message) {
            void messageApi.success(state.message);
            window.history.replaceState({}, document.title);
        }
    }, [location.state, messageApi]);

    const {movies, loading, hasMore, loadMore} = useMovies({
        apiEndpoint,
        searchQuery,
        selectedGenres
    });

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    let cardsPerPage: number;
    let colSpan = 6;

    if (windowWidth < 375) {
        cardsPerPage = 2;
        colSpan = 24;
    } else if (windowWidth >= 375 && windowWidth < 576) {
        cardsPerPage = 4;
        colSpan = 12;
    } else if (windowWidth >= 576 && windowWidth < 768) {
        cardsPerPage = 6;
        colSpan = 8;
    } else {
        cardsPerPage = 8;
        colSpan = 6;
    }


    const filteredMovies = useMemo(() => {
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
        return result;
    }, [movies, searchQuery, selectedGenres]);

    const currentMovies = useMemo(() =>
        filteredMovies.slice(
            (currentPage - 1) * cardsPerPage,
            currentPage * cardsPerPage
        ), [filteredMovies, currentPage, cardsPerPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedGenres, searchQuery]);

    const isLoading = loading || (showGenreFilter && genresLoading);

    return (
        <div className="movies-grid-container">
            {contextHolder}
            <div className="movies-grid-header">
                <Row justify="space-between" align="middle" className="movies-grid-header-row">
                    <Col>
                        <Title level={5} className="subtitle">
                            {searchQuery ? `Search results for: "${searchQuery}"` : title}
                        </Title>
                    </Col>
                    {showGenreFilter && !searchQuery && (
                        <Col>
                            <Space>
                                <Select
                                    mode="multiple"
                                    placeholder="Filter by genre"
                                    className="movies-grid-genre-select"
                                    onChange={handleGenreChange}
                                    value={selectedGenres}
                                    allowClear
                                    maxTagCount="responsive"
                                >
                                    {genres.map(({id, name}) => (
                                        <Option key={id} value={name}>{name}</Option>
                                    ))}
                                </Select>
                            </Space>
                        </Col>
                    )}
                </Row>
            </div>

            {isLoading ? (
                <div className="movies-grid-loading">
                    <Spin size="large"/>
                </div>
            ) : filteredMovies.length === 0 ? (
                <div className="movies-grid-empty">
                    <Empty description={
                        searchQuery
                            ? `No movie cards found for "${searchQuery}"`
                            : selectedGenres.length > 0
                                ? "No movie cards match the selected genres"
                                : emptyMessage
                    }/>
                </div>
            ) : (
                <>
                    <div className="movies-grid-content">
                        <Row gutter={[12, 12]}>
                            {currentMovies.map(movie => (
                                <Col
                                    key={movie.id}
                                    span={colSpan}
                                    className="movies-grid-col"
                                >
                                    <MovieCard movie={movie}/>
                                </Col>
                            ))}
                        </Row>
                    </div>

                    <div className="movies-grid-pagination-container">
                        <Pagination
                            current={currentPage}
                            onChange={setCurrentPage}
                            total={filteredMovies.length}
                            pageSize={cardsPerPage}
                            showSizeChanger={false}
                            showQuickJumper={false}
                            responsive={true}
                            hideOnSinglePage={true}
                            className="movies-grid-pagination"
                        />
                        {hasMore && (
                            <div style={{textAlign: 'center', marginTop: '16px'}}>
                                <button
                                    className="load-more-btn"
                                    onClick={() => void loadMore()}
                                    disabled={loading}
                                >
                                    {loading ? 'Loading...' : 'Load More'}
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default MoviesGrid;
