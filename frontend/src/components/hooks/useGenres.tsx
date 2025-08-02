import { useState, useEffect } from 'react';
import axios from 'axios';
import {type Genre, type NewGenreData} from '../movie/movie-form/types.tsx';
import useMessage from 'antd/es/message/useMessage';

export const useGenres = () => {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loading, setLoading] = useState(false);
    const [customMessage] = useMessage();

    const fetchGenres = async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await axios.get('/api/genres', { withCredentials: true });
            setGenres(response.data);
        } catch (err) {
            console.error('Failed to fetch genres:', err);
            customMessage.error('Error loading genres');
        } finally {
            setLoading(false);
        }
    };

    const addGenre = async (genreData: NewGenreData): Promise<boolean> => {
        try {
            const response = await axios.post('/api/genres', genreData, {
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' },
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

            let errorMessage = 'Error adding genre';
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 409) {
                    errorMessage = 'Genre with this name already exists';
                } else if (err.response?.data?.message) {
                    errorMessage = err.response.data.message;
                }
            }

            customMessage.error(errorMessage);
            return false;
        }
    };

    useEffect(() => {
        fetchGenres();
    }, []);

    return { genres, loading, addGenre };
};
