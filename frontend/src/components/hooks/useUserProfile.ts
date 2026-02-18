import {useState, useCallback} from 'react';
import axios, {type AxiosError} from 'axios';
import {message} from 'antd';

import type {User} from '../../types/auth';

interface UseUserProfileReturn {
    user: User | null;
    loading: boolean;
    error: string | null;
    fetchUserProfile: () => Promise<void>;
    updateUserProfile: (data: Partial<User>) => Promise<void>;
}

export const useUserProfile = (): UseUserProfileReturn => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUserProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<User>('/api/users/account', {withCredentials: true});
            setUser(response.data);
        } catch (err) {
            const axiosError = err as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to fetch user profile';
            setError(errorMessage);
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUserProfile = useCallback(async (data: Partial<User>) => {
        setLoading(true);
        setError(null);
        try {
            await axios.put('/api/users/account/update', data, {withCredentials: true});
            message.success('Profile updated successfully');
            setUser(prev => prev ? {...prev, ...data} : null);
        } catch (err) {
            const axiosError = err as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to update profile';
            setError(errorMessage);
            message.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        user,
        loading,
        error,
        fetchUserProfile,
        updateUserProfile
    };
};
