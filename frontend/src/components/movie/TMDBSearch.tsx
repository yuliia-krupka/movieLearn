import React, {useState, useEffect, useRef} from 'react';
import {Input, Spin, List, Typography} from 'antd';
import {SearchOutlined} from '@ant-design/icons';
import {tmdbService, type TMDBMovie, getMovieImageUrl} from '../../services/tmdbService';
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

    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (query.length > 2) {
                setLoading(true);
                const searchResults = await tmdbService.searchMovies(query);
                setResults(searchResults);
                setDropdownVisible(true);
                setLoading(false);
            } else {
                setResults([]);
                setDropdownVisible(false);
            }
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [query]);

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
                                                src={getMovieImageUrl(movie)}
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
