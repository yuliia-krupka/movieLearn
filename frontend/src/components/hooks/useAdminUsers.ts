import {useState, useCallback} from 'react';
import {type AxiosError} from 'axios';
import {message as antMessage} from 'antd';
import type {MessageInstance} from 'antd/es/message/interface';
import {userService} from '../../services/userService';

import type {User, UseAdminUsersReturn} from "../../types/admin";

const rolePriority: Record<string, number> = {
    ADMIN: 1,
    USER: 2,
};

export const useAdminUsers = (messageApi?: MessageInstance): UseAdminUsersReturn => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({});
    const msg = messageApi || antMessage;

    const fetchUsers = useCallback(async (email: string = '') => {
        setLoading(true);
        try {
            const fetchedUsers = await userService.getAll(email || undefined);

            const sorted = fetchedUsers.slice().sort((a, b) =>
                (rolePriority[a.role?.toUpperCase()] || 99) - (rolePriority[b.role?.toUpperCase()] || 99)
            );

            setUsers(sorted);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            msg.error('Failed to load users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [msg]);

    const updateUserRole = useCallback(async (userId: number, newRole: string) => {
        setActionLoading(prev => ({...prev, [userId]: true}));
        try {
            await userService.updateRole(userId, newRole);
            msg.success('User role updated successfully');
            setUsers(prevUsers => {
                const updated = prevUsers.map(user =>
                    user.id === userId ? {...user, role: newRole} : user
                );
                return updated.sort((a, b) =>
                    (rolePriority[a.role?.toUpperCase()] || 99) - (rolePriority[b.role?.toUpperCase()] || 99)
                );
            });
        } catch (error) {
            console.error('Failed to update role:', error);
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMsg = axiosError.response?.status === 403
                ? 'You do not have permission to change roles'
                : axiosError.response?.data?.message || 'Failed to update user role';
            msg.error(errorMsg);
            throw error;
        } finally {
            setActionLoading(prev => ({...prev, [userId]: false}));
        }
    }, [msg]);

    const deleteUser = useCallback(async (userId: number) => {
        setActionLoading(prev => ({...prev, [userId]: true}));
        try {
            await userService.deleteUser(userId);
            msg.success('User deleted successfully');
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        } catch (error) {
            console.error('Failed to delete user:', error);
            const axiosError = error as AxiosError<{ message: string }>;
            msg.error(axiosError.response?.data?.message || 'Failed to delete user');
            throw error;
        } finally {
            setActionLoading(prev => ({...prev, [userId]: false}));
        }
    }, [msg]);

    return {
        users,
        loading,
        actionLoading,
        fetchUsers,
        updateUserRole,
        deleteUser
    };
};
