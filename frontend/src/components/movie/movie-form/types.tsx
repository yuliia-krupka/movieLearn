export interface Genre {
    id: number;
    name: string;
}

export interface MovieFormData {
    title: string;
    description: string;
    genres: string[];
}

export interface NewGenreData {
    name: string;
}