import apiClient from './apiClient';
import type {User} from '../types/auth';

export const userService = {
    async getAll(email?: string): Promise<User[]> {
        const params = email ? {email} : {};
        const {data} = await apiClient.get<User[]>('/users', {params});
        return Array.isArray(data) ? data : [];
    },

    async getProfile(): Promise<User> {
        const {data} = await apiClient.get<User>('/users/account');
        return data;
    },

    async updateProfile(profileData: Partial<User>): Promise<void> {
        await apiClient.put('/users/account/update', profileData);
    },

    async updateRole(userId: number, newRole: string): Promise<void> {
        await apiClient.put(`/users/${userId}/role/${newRole}`, null);
    },

    async deleteUser(userId: number): Promise<void> {
        await apiClient.delete(`/users/${userId}`);
    },

    async setLevel(level: string): Promise<void> {
        await apiClient.put(`/users/level/${level}`, {});
    },

    async setInterests(interests: string[]): Promise<void> {
        await apiClient.put('/users/interests', interests);
    },
};
