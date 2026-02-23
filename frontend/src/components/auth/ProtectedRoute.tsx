import {useNavigate} from 'react-router-dom';
import {message} from 'antd';
import {useEffect, type ReactNode} from 'react';
import {useAuth} from "./useAuth.tsx";

export const ProtectedRoute = ({children, requireAuth = true, requireAdmin = false, requireOnboarding = false}: {
    children: ReactNode,
    requireAuth?: boolean,
    requireAdmin?: boolean,
    requireOnboarding?: boolean
}) => {
    const {isAuthenticated, isAdmin, isLoading, user} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading) {
            if (requireAuth && !isAuthenticated) {
                void message.error('Please log in first');
                navigate('/', {replace: true});
            } else if (requireAdmin && !isAdmin) {
                navigate('/access-denied', {replace: true});
            } else if (requireOnboarding && isAuthenticated && user && !isAdmin) {
                if (!user.englishLevel) {
                    navigate('/level', {replace: true});
                } else if (!user.interests || user.interests.length === 0) {
                    navigate('/interests', {replace: true});
                }
            }
        }
    }, [isAuthenticated, isAdmin, isLoading, requireAuth, requireAdmin, requireOnboarding, user, navigate]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return <>{children}</>;
};
