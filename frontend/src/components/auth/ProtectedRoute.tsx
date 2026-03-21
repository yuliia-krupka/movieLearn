import {useNavigate} from 'react-router-dom';
import {message, Spin} from 'antd';
import {useEffect, type ReactNode} from 'react';
import {useAuth} from "./useAuth.tsx";
import "./ProtectedRoute.css";

export const ProtectedRoute = ({
                                   children,
                                   requireAuth = true,
                                   requireAdmin = false,
                                   requireUser = false,
                                   requireOnboarding = false
                               }: {
    children: ReactNode,
    requireAuth?: boolean,
    requireAdmin?: boolean,
    requireUser?: boolean,
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
            } else if (requireUser && isAdmin) {
                navigate('/admin', {replace: true});
            } else if (requireOnboarding && isAuthenticated && user && !isAdmin) {
                if (!user.englishLevel) {
                    navigate('/level', {replace: true});
                } else if (!user.interests || user.interests.length === 0) {
                    navigate('/interests', {replace: true});
                }
            }
        }
    }, [isAuthenticated, isAdmin, isLoading, requireAuth, requireAdmin, requireUser, requireOnboarding, user, navigate]);

    if (isLoading) {
        return (
            <div className="protected-route-loader">
                <Spin size="large"/>
            </div>
        );
    }

    const isUnauthenticated = requireAuth && !isAuthenticated;
    const isNotAdmin = requireAdmin && !isAdmin;
    const isNotUser = requireUser && isAdmin;
    const isMissingOnboarding = requireOnboarding && isAuthenticated && user && !isAdmin && (!user.englishLevel || !user.interests || user.interests.length === 0);

    if (isUnauthenticated || isNotAdmin || isNotUser || isMissingOnboarding) {
        return null;
    }

    return <>{children}</>;
};
