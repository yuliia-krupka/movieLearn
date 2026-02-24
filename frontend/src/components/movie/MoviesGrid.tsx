import React, {useEffect, useState} from 'react';
import {
    Row, Col, Typography, Pagination,
    Spin, Empty, Select, Space
} from 'antd';
import MovieCard from "./MovieCard";
import {useGenres} from '../hooks/useGenres';
import {useLocation} from 'react-router-dom';
import useMessage from 'antd/es/message/useMessage';
import '../css/MoviesGrid.css';

const {Title} = Typography;
const {Option} = Select;

import {useMovies} from '../hooks/useMovies';
import '../css/MoviesGrid.css';

interface MoviesGridProps {
    apiEndpoint: string;
    title: string;
    emptyMessage?: string;
    showGenreFilter?: boolean;
}

const MoviesGrid: React.FC<MoviesGridProps> = ({
                                                   apiEndpoint,
                                                   title,
                                                   emptyMessage = "No movies available. Please check back later!",
                                                   showGenreFilter = true,
                                               }) => {
    const {genres, loading: genresLoading} = useGenres();
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const location = useLocation();
    const [messageApi, contextHolder] = useMessage();


    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search');

    useEffect(() => {
        const state = location.state as { message?: string } | null;
        if (state?.message) {
            void messageApi.success(state.message);
            // Clear location state to prevent message from showing again on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state, messageApi]);

    const {movies, loading} = useMovies({
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


    const filteredMovies = searchQuery ? movies : (
        selectedGenres.length === 0
            ? movies
            : movies.filter(movie =>
                selectedGenres.some(genre => movie.genres.includes(genre))
            )
    );

    const currentMovies = filteredMovies.slice(
        (currentPage - 1) * cardsPerPage,
        currentPage * cardsPerPage
    );

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
                                    onChange={setSelectedGenres}
                                    value={selectedGenres}
                                    allowClear
                                    maxTagCount={2}
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
                            ? `No movies found for "${searchQuery}"`
                            : selectedGenres.length > 0
                                ? "No movies match the selected genres"
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
                            className="movies-grid-pagination"
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default MoviesGrid;
