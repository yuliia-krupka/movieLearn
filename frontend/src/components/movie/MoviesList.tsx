import React from 'react';
import MainLayout from "../layout/MainLayout.tsx";
import MoviesGrid from "./MoviesGrid";
import '../css/Layout.css';

const MoviesList: React.FC = () => {
    return (
        <MainLayout className="content-movies" contentStyle={{
            overflow: 'hidden',
            height: 'calc(100vh - 90px)',
        }}>
            <MoviesGrid
                apiEndpoint="/api/movies"
                title="Choose your movie to start a lesson!"
                emptyMessage="No movies available. Please check back later!"
                showGenreFilter={true}
            />
        </MainLayout>
    );
};

export default MoviesList;