import {useState, useCallback} from 'react';
import {type AxiosError} from 'axios';
import {message} from 'antd';
import {userService} from '../../services/userService';

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
            const data = await userService.getProfile();
            setUser(data);
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
            await userService.updateProfile(data);
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
