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
        <div style={{width: '100%', padding: '0 20px', display: 'flex', flexDirection: 'column', height: '100%'}}>
            {contextHolder}
            <div style={{flexShrink: 0}}>
                <Row justify="space-between" align="middle" style={{marginBottom: '16px'}}>
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
                                    style={{width: 200}}
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
                <div style={{display: 'flex', justifyContent: 'center', padding: '50px 0', flex: 1}}>
                    <Spin size="large"/>
                </div>
            ) : filteredMovies.length === 0 ? (
                <div style={{display: 'flex', justifyContent: 'center', padding: '50px 0', flex: 1}}>
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
                    <div style={{flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: '16px'}}>
                        <Row gutter={[12, 12]}>
                            {currentMovies.map(movie => (
                                <Col
                                    key={movie.id}
                                    xs={24}
                                    sm={colSpan}
                                    md={colSpan}
                                    lg={colSpan}
                                    xl={colSpan}
                                    style={{display: 'flex', justifyContent: 'center'}}
                                >
                                    <MovieCard movie={movie}/>
                                </Col>
                            ))}
                        </Row>
                    </div>

                    <div style={{
                        flexShrink: 0,
                        padding: '16px 0',
                        borderTop: '1px solid #f0f0f0',
                        backgroundColor: '#fff'
                    }}>
                        <Pagination
                            current={currentPage}
                            onChange={setCurrentPage}
                            total={filteredMovies.length}
                            pageSize={cardsPerPage}
                            showSizeChanger={false}
                            showQuickJumper={false}
                            responsive={true}
                            style={{textAlign: 'center', margin: 0}}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default MoviesGrid;
