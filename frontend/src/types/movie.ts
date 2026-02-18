export interface Movie {
    id: number;
    title: string;
    description: string;
    genres: string[];
    image: string | null;
}

export interface MovieFormData {
    title: string;
    description: string;
    genres: string[];
}

export interface FormValues {
    title: string;
    description: string;
    genres: string[];
}

export interface NewGenreData {
    name: string;
}
