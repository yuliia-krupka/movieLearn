import {useState, useEffect, useCallback} from 'react';
import {type Genre} from '../../types/genre';
import {type NewGenreData} from '../../types/movie';
import {message} from 'antd';
import {genreService} from '../../services/genreService';

export const useGenres = () => {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchGenres = useCallback(async (): Promise<void> => {
        try {
            setLoading(true);
            const data = await genreService.getAll();
            setGenres(data);
        } catch (err) {
            console.error('Failed to fetch genres:', err);
            void message.error('Error loading genres');
        } finally {
            setLoading(false);
        }
    }, []);

    const addGenre = async (genreData: NewGenreData): Promise<boolean> => {
        try {
            const newGenre = await genreService.create(genreData);

            setGenres(prev => [...prev, {id: newGenre.id, name: genreData.name}]);
            void message.success('Genre added successfully!');
            return true;
        } catch (err: unknown) {
            console.error('Failed to add genre:', err);
            throw err;
        }
    };

    const updateGenre = async (id: number, data: { name: string }) => {
        await genreService.update(id, data);
        await fetchGenres();
    };

    const deleteGenre = async (id: number) => {
        await genreService.delete(id);
        await fetchGenres();
    };

    useEffect(() => {
        void fetchGenres();
    }, [fetchGenres]);

    return {genres, loading, addGenre, updateGenre, deleteGenre, fetchGenres};
};
