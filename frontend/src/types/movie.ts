export interface Movie {
    id: number;
    title: string;
    image?: string;
    overview?: string;
    genres: string[];
    creatorId?: number;
    userEnglishLevel?: string;
}

export interface MovieFormData {
    title: string;
    image?: string;
    overview?: string;
    genres: string[];
}

export interface FormValues {
    title: string;
    image?: string;
    overview?: string;
    genres: string[];
}

export interface NewGenreData {
    name: string;
}

export interface MovieDetails {
    id: number;
    title: string;
    image?: string;
    overview?: string;
    genres: string[];
    creatorId?: number;
    userEnglishLevel?: string;
}
