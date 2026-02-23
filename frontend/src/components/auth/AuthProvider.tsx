import React, {useState, useEffect, type ReactNode} from 'react';
import type {User} from '../../types/auth';
import {AuthContext} from './AuthContext';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
    const [user, setUser] = useState<User & { id?: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuthStatus = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/users/account', {
                credentials: 'include',
            });
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void checkAuthStatus();
    }, []);

    const isAdmin = user?.role === 'ADMIN';

    const login = () => {
        window.location.href = '/oauth2/authorization/google';
    };

    const logout = async () => {
        try {
            await fetch('/logout', {method: 'POST'});
            setUser(null);
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const value = {
        user,
        isAdmin,
        isLoading,
        isAuthenticated: !!user,
        currentUserId: user?.id,
        login,
        logout,
        checkAuthStatus
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
