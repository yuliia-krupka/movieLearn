import {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import {type Genre} from '../../types/genre';
import {type NewGenreData} from '../../types/movie';
import useMessage from 'antd/es/message/useMessage';

export const useGenres = () => {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loading, setLoading] = useState(false);
    const [customMessage] = useMessage();

    const fetchGenres = useCallback(async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await axios.get('/api/genres', {withCredentials: true});
            setGenres(response.data);
        } catch (err) {
            console.error('Failed to fetch genres:', err);
            customMessage.error('Error loading genres');
        } finally {
            setLoading(false);
        }
    }, [customMessage]);

    const addGenre = async (genreData: NewGenreData): Promise<boolean> => {
        try {
            const response = await axios.post('/api/genres', genreData, {
                withCredentials: true,
                headers: {'Content-Type': 'application/json'},
            });

            const newGenre: Genre = {
                id: response.data.id,
                name: genreData.name,
            };

            setGenres(prev => [...prev, newGenre]);
            customMessage.success('Genre added successfully!');
            return true;
        } catch (err: unknown) {
            console.error('Failed to add genre:', err);
            throw err;
        }
    };

    const updateGenre = async (id: number, data: { name: string }) => {
        await axios.put(`/api/genres/${id}`, data, {withCredentials: true});
        await fetchGenres();
    };

    const deleteGenre = async (id: number) => {
        await axios.delete(`/api/genres/${id}`, {withCredentials: true});
        await fetchGenres();
    };

    useEffect(() => {
        void fetchGenres();
    }, [fetchGenres]);

    return {genres, loading, addGenre, updateGenre, deleteGenre, fetchGenres};
};
