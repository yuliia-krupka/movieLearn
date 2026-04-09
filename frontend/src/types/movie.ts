export interface Movie {
    id: number;
    title: string;
    tmdbId: number;
    posterPath?: string;
    backdropPath?: string;
    overview?: string;
    genres: string[];
    creatorId?: number;
    userEnglishLevel?: string;
}

export interface MovieFormData {
    title: string;
    tmdbId: number;
    posterPath?: string;
    backdropPath?: string;
    overview?: string;
    genres: string[];
}

export interface FormValues {
    title: string;
    tmdbId: number;
    posterPath?: string;
    backdropPath?: string;
    overview?: string;
    genres: string[];
}

export interface NewGenreData {
    name: string;
}

export interface MovieDetails {
    id: number;
    title: string;
    tmdbId: number;
    posterPath?: string;
    backdropPath?: string;
    overview?: string;
    genres: string[];
    creatorId?: number;
    userEnglishLevel?: string;
}
