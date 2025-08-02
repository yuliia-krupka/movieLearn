import React, {useEffect, useState} from 'react';
import {
    Row, Col, Typography, Pagination,
    Spin, Empty, message as antMessage, Select, Space
} from 'antd';
import MovieCard from "./MovieCard";
import {useGenres} from '../hooks/useGenres';
import axios from 'axios';

const {Title} = Typography;
const {Option} = Select;

interface Movie {
    id: number;
    title: string;
    description: string;
    genres: string[];
    image: string;
}

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
    const [movies, setMovies] = useState<Movie[]>([]);
    const {genres, loading: genresLoading} = useGenres();
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [messageApi, contextHolder] = antMessage.useMessage();

    const [pageSize, setPageSize] = useState<number>(8);

    useEffect(() => {
        function updatePageSize() {
            const width = window.innerWidth;
            if (width < 350) {
                setPageSize(2);
            } else if (width >= 350 && width < 768) {
                setPageSize(6);
            } else {
                setPageSize(8);
            }
        }

        updatePageSize();
        window.addEventListener('resize', updatePageSize);
        return () => window.removeEventListener('resize', updatePageSize);
    }, []);

    useEffect(() => {
        async function fetchMovies() {
            setLoading(true);
            try {
                const response = await axios.get(apiEndpoint, {withCredentials: true});
                setMovies(response.data);
            } catch (err) {
                console.error(err);
                messageApi.error('Error during loading movies, try again later.');
            } finally {
                setLoading(false);
            }
        }

        fetchMovies().catch(err => {
            console.error('Unhandled error in fetchMovies:', err);
        });
    }, [apiEndpoint, messageApi]);

    const filteredMovies = selectedGenres.length === 0
        ? movies
        : movies.filter(movie =>
            selectedGenres.some(genre => movie.genres.includes(genre))
        );

    const currentMovies = filteredMovies.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedGenres, pageSize]);

    const isLoading = loading || (showGenreFilter && genresLoading);

    return (
        <>
            {contextHolder}
            <Row justify="space-between" align="middle" className="title-row">
                <Col>
                    <Title level={5} className="subtitle">{title}</Title>
                </Col>
                {showGenreFilter && (
                    <Col>
                        <Space>
                            <Select
                                mode="multiple"
                                placeholder="Filter by genre"
                                style={{width: 200}}
                                onChange={setSelectedGenres}
                                value={selectedGenres}
                                allowClear
                            >
                                {genres.map(({id, name}) => (
                                    <Option key={id} value={name}>{name}</Option>
                                ))}
                            </Select>
                        </Space>
                    </Col>
                )}
            </Row>

            {isLoading ? (
                <div style={{display: 'flex', justifyContent: 'center', padding: '50px 0'}}>
                    <Spin size="large"/>
                </div>
            ) : filteredMovies.length === 0 ? (
                <div style={{display: 'flex', justifyContent: 'center', padding: '50px 0'}}>
                    <Empty description={
                        selectedGenres.length > 0
                            ? "No movies match the selected genres"
                            : emptyMessage
                    }/>
                </div>
            ) : (
                <>
                    <Row gutter={[16, 16]} style={{marginBottom: '16px'}}>
                        {currentMovies.map(movie => (
                            <Col
                                key={movie.id}
                                xs={24}  // 1 картка на ряд (24/24)
                                sm={12}  // 1 картка на ряд (24/24)
                                md={12}  // 2 картки на ряд (12/24)
                                lg={6}  // 2 картки на ряд (12/24)
                                xl={6}   // 4 картки на ряд (6/24)
                                xxl={6}  // 4 картки на ряд (6/24)
                                style={{display: 'flex', justifyContent: 'center'}}
                            >
                                <MovieCard movie={movie}/>
                            </Col>
                        ))}
                    </Row>

                    <Pagination
                        current={currentPage}
                        onChange={setCurrentPage}
                        total={filteredMovies.length}
                        pageSize={pageSize}
                        showSizeChanger={false}
                        showQuickJumper={false}
                        responsive={true}
                        showTotal={(total, range) =>
                            `${range[0]}-${range[1]} of ${total} movies`
                        }
                        style={{textAlign: 'center', margin: '16px 0'}}
                    />
                </>
            )}
        </>
    );
};

export default MoviesGrid;
