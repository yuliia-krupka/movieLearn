import React from 'react';
import MainLayout from "../layout/MainLayout.tsx";
import MoviesGrid from "./MoviesGrid";
import '../layout/Layout.css';

const MoviesList: React.FC = () => {
    return (
        <MainLayout className="content-movies">
            <MoviesGrid
                apiEndpoint="/api/movies"
                title="Choose your movie card to start a lesson!"
                emptyMessage="No movie cards available. Please check back later!"
                showGenreFilter={true}
            />
        </MainLayout>
    );
};

export default MoviesList;