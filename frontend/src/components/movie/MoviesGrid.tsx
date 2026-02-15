import React, { useEffect, useState } from 'react';
import {
    Row, Col, Typography, Pagination,
    Spin, Empty, Select, Space
} from 'antd';
import MovieCard from "./MovieCard";
import { useGenres } from '../hooks/useGenres';
import { useLocation } from 'react-router-dom';
import '../css/MoviesGrid.css';

const { Title } = Typography;
const { Option } = Select;

import { useMovies } from '../hooks/useMovies';
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
    const { genres, loading: genresLoading } = useGenres();
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const location = useLocation();


    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search');

    const { movies, loading } = useMovies({
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

    let cardsPerPage = 8;
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
        <>
            <Row justify="space-between" align="middle" className="title-row">
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
                                style={{ width: 200 }}
                                onChange={setSelectedGenres}
                                value={selectedGenres}
                                allowClear
                            >
                                {genres.map(({ id, name }) => (
                                    <Option key={id} value={name}>{name}</Option>
                                ))}
                            </Select>
                        </Space>
                    </Col>
                )}
            </Row>

            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
                    <Spin size="large" />
                </div>
            ) : filteredMovies.length === 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
                    <Empty description={
                        searchQuery
                            ? `No movies found for "${searchQuery}"`
                            : selectedGenres.length > 0
                                ? "No movies match the selected genres"
                                : emptyMessage
                    } />
                </div>
            ) : (
                <>
                    <Row gutter={[12, 12]} style={{ marginBottom: '16px' }}>
                        {currentMovies.map(movie => (
                            <Col
                                key={movie.id}
                                xs={24}
                                sm={colSpan}
                                md={colSpan}
                                lg={colSpan}
                                xl={colSpan}
                                style={{ display: 'flex', justifyContent: 'flex-start' }} // Вирівнюємо картки ліворуч
                            >
                                <MovieCard movie={movie} />
                            </Col>
                        ))}
                    </Row>

                    <Pagination
                        current={currentPage}
                        onChange={setCurrentPage}
                        total={filteredMovies.length}
                        pageSize={cardsPerPage}
                        showSizeChanger={false}
                        showQuickJumper={false}
                        responsive={true}
                        style={{ textAlign: 'center', margin: '16px 0' }}
                    />
                </>
            )}
        </>
    );
};

export default MoviesGrid;
