import React from 'react';
import { Layout } from 'antd';
import { Content } from "antd/es/layout/layout";
import Sidebar from "../layout/Sidebar.tsx";
import TopBar from "../layout/TopBar.tsx";
import MoviesGrid from "./MoviesGrid";
import '../css/Layout.css';

const MoviesList: React.FC = () => {
    return (
        <Layout style={{ height: '100vh' }}>
            <Sidebar/>
            <Layout className="account-root-layout">
                <TopBar/>
                <Content className="content-movies" style={{
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
                </Content>
            </Layout>
        </Layout>
    );
};

export default MoviesList;