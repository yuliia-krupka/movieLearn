import React, {useEffect, useState} from 'react';
import {
    Layout, Row, Col, Typography, Pagination,
    Spin, Empty, message as antMessage, Select, Space
} from 'antd';

import MovieCard from "./MovieCard";
import {Content} from "antd/es/layout/layout";
import Sidebar from "../layout/sidebar/Sidebar.tsx";
import TopBar from "../layout/topbar/TopBar.tsx";
import '../layout/Layout.css';
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

interface Genre {
    id: number;
    name: string;
    displayName: string;
}

const pageSize = 8;

const MoviesList: React.FC = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [messageApi, contextHolder] = antMessage.useMessage();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [moviesRes, genresRes] = await Promise.all([
                    axios.get('/api/movies', {withCredentials: true}),
                    axios.get('/api/genres', {withCredentials: true}),
                ]);

                setMovies(moviesRes.data);
                setGenres(genresRes.data);
            } catch (err) {
                console.error(err);
                messageApi.error('Помилка завантаження даних. Спробуйте пізніше.');
            } finally {
                setLoading(false);
            }
        }

        fetchData().catch(err => {
            console.error('Unhandled error in fetchData:', err);
        });
    }, [messageApi]);


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
    }, [selectedGenres]);

    return (
        <Layout>
            <Sidebar/>
            <Layout className="account-root-layout ">
                <TopBar/>
                {contextHolder}
                <Content className="content-movies">
                    <Row justify="space-between" align="middle" className="title-row">
                        <Col>
                            <Title level={5} className="subtitle">
                                Choose your movie to start a lesson!
                            </Title>
                        </Col>
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
                                    {genres.map(({id, name, displayName}) => (
                                        <Option key={id} value={name}>
                                            {displayName}
                                        </Option>
                                    ))}
                                </Select>
                            </Space>
                        </Col>
                    </Row>

                    <div className="movies-container">
                        <div className="movies-list">
                            {loading ? (
                                <Spin size="large" style={{margin: 'auto'}}/>
                            ) : filteredMovies.length === 0 ? (
                                <Empty description={
                                    selectedGenres.length > 0
                                        ? "No movies match the selected genres"
                                        : "No movies available. Please check back later!"
                                }/>
                            ) : (
                                <Row gutter={[12, 12]} style={{width: '100%'}}>
                                    {currentMovies.map(movie => (
                                        <Col
                                            key={movie.id}
                                            xs={12} sm={12} md={8} lg={6}
                                            style={{display: 'flex', justifyContent: 'center'}}
                                        >
                                            <MovieCard movie={movie}/>
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </div>

                        {filteredMovies.length > pageSize && (
                            <Row className="pagination-row">
                                <Pagination
                                    current={currentPage}
                                    onChange={setCurrentPage}
                                    total={filteredMovies.length}
                                    pageSize={pageSize}
                                    showSizeChanger={false}
                                />
                            </Row>
                        )}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default MoviesList;
