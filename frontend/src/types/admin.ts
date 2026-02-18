import type {User} from "./auth";

export type {User};

export interface UseAdminUsersReturn {
    users: User[];
    loading: boolean;
    actionLoading: { [key: number]: boolean };
    fetchUsers: (email?: string) => Promise<void>;
    updateUserRole: (userId: number, newRole: string) => Promise<void>;
    deleteUser: (userId: number) => Promise<void>;
}
