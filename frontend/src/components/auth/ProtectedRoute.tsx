import {useNavigate} from 'react-router-dom';
import {message} from 'antd';
import {useEffect, type ReactNode} from 'react';
import {useAuth} from "./useAuth.tsx";

export const ProtectedRoute = ({children, requireAuth = true, requireAdmin = false}: {
    children: ReactNode,
    requireAuth?: boolean,
    requireAdmin?: boolean
}) => {
    const {isAuthenticated, isAdmin, isLoading} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading) {
            if (requireAuth && !isAuthenticated) {
                message.error('Please log in first');
                navigate('/', {replace: true});
            } else if (requireAdmin && !isAdmin) {
                message.error('Access denied');
                navigate(-1);
            }
        }
    }, [isAuthenticated, isAdmin, isLoading, requireAuth, requireAdmin, navigate]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return <>{children}</>;
};
