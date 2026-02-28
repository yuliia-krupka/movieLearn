import React from 'react';
import MoviesGrid from "./MoviesGrid";
import '../layout/Layout.css';
import MainLayout from "../layout/MainLayout.tsx";

const HomePage: React.FC = () => {
    return (
        <MainLayout className="content-movies" contentStyle={{height: 'calc(100vh - 90px)', overflow: 'hidden'}}>
            <MoviesGrid
                apiEndpoint="/api/movies/home"
                title="Lessons you started!"
                emptyMessage="You haven't added any movies yet. Start by adding your first movie!"
                showGenreFilter={true}
            />
        </MainLayout>
    );
};

export default HomePage;

