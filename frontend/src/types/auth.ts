export interface User {
    id: number;
    email: string;
    name: string;
    lastname?: string;
    englishLevel?: string;
    interests?: string[];
    photo?: string;
    role: string;
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
