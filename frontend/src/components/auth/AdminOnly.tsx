import React from 'react';
import { useAuth } from './useAuth.tsx';

interface AdminOnlyProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const AdminOnly: React.FC<AdminOnlyProps> = ({
                                                        children,
                                                        fallback = null,
                                                    }) => {
    const { isAdmin } = useAuth();

    if (isAdmin) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};
