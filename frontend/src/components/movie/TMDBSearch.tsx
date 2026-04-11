import React, {useState, useEffect, useRef} from 'react';
import {Input, Spin, List, Typography} from 'antd';
import {SearchOutlined} from '@ant-design/icons';
import {tmdbService, type TMDBMovie, getAbstractImage} from '../../services/tmdbService';
import {useDebounce} from '../hooks/useDebounce';
import './TMDBSearch.css';

const {Text} = Typography;

interface TMDBSearchProps {
    onSelectMovie: (movie: TMDBMovie) => void;
    initialQuery?: string;
}

const TMDBSearch: React.FC<TMDBSearchProps> = ({onSelectMovie, initialQuery = ''}) => {
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<TMDBMovie[]>([]);
    const [loading, setLoading] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setDropdownVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const debouncedQuery = useDebounce(query, 500);

    useEffect(() => {
        let isMounted = true;

        const performSearch = async () => {
            if (debouncedQuery.length > 2) {
                setLoading(true);
                try {
                    const searchResults = await tmdbService.searchMovies(debouncedQuery);
                    if (isMounted) {
                        setResults(searchResults);
                        setDropdownVisible(true);
                        setLoading(false);
                    }
                } catch (error) {
                    if (isMounted) {
                        setLoading(false);
                        console.error("TMDB Search Error:", error);
                    }
                }
            } else {
                setResults([]);
                setDropdownVisible(false);
            }
        };

        void performSearch();

        return () => {
            isMounted = false;
        };
    }, [debouncedQuery]);

    const handleSelect = (movie: TMDBMovie) => {
        onSelectMovie(movie);
        setDropdownVisible(false);
    };

    return (
        <div className="tmdb-search-container" ref={containerRef}>
            <Input
                placeholder="Search movie title in TMDB..."
                prefix={<SearchOutlined/>}
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    if (e.target.value.length <= 2) {
                        setDropdownVisible(false);
                    }
                }}
                onFocus={() => {
                    if (results.length > 0) setDropdownVisible(true);
                }}
            />
            {dropdownVisible && (
                <div className="tmdb-search-dropdown">
                    {loading ? (
                        <div className="tmdb-search-loading">
                            <Spin/>
                        </div>
                    ) : (
                        <List
                            itemLayout="horizontal"
                            dataSource={results}
                            renderItem={(movie) => (
                                <List.Item
                                    className="tmdb-search-item"
                                    onClick={() => handleSelect(movie)}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <img
                                                src={getAbstractImage(movie.id)}
                                                alt={movie.title}
                                                className="tmdb-search-avatar-img"
                                            />
                                        }
                                        title={<Text
                                            strong>{movie.title} ({movie.release_date?.substring(0, 4) || 'N/A'})</Text>}
                                        description={<Text type="secondary" ellipsis>{movie.overview}</Text>}
                                    />
                                </List.Item>
                            )}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default TMDBSearch;
