import React from 'react';
import MainLayout from "../layout/MainLayout.tsx";
import MoviesGrid from "./MoviesGrid";
import '../css/Layout.css';

const MoviesList: React.FC = () => {
    return (
        <MainLayout className="content-movies" contentStyle={{
            overflow: 'auto',
            height: 'calc(100vh - 64px)',
            padding: '16px'
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