import React, {useState, useEffect, type ReactNode} from 'react';
import type {User} from '../types/auth';
import {AuthContext} from './AuthContext';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
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

        void checkAuthStatus();
    }, []);

    const isAdmin = user?.role === 'ADMIN';

    const value = {
        user,
        login: () => {
            window.location.href = "/oauth2/authorization/google";
        },
        logout: async () => {
            try {
                await fetch('/logout', {method: 'POST', credentials: 'include'});
                setUser(null);
                window.location.href = '/';
            } catch (error) {
                console.error('Logout failed:', error);
            }
        },
        isAdmin,
        isLoading,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
