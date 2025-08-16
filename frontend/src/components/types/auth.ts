export interface User {
    id: number;
    email: string;
    name: string;
    englishLevel?: string;
    interests?: string[];
    role?: "USER" | "ADMIN";
}

export interface AuthContextType {
    user: User | null;
    login: () => void;
    logout: () => void;
    isAdmin: boolean;
    isLoading: boolean;
    isAuthenticated: boolean;
    currentUserId?: number;
}