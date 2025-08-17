import React from 'react';
import {Layout} from 'antd';
import {Content} from "antd/es/layout/layout";
import Sidebar from "../layout/Sidebar.tsx";
import TopBar from "../layout/TopBar.tsx";
import MoviesGrid from "./MoviesGrid";
import '../css/Layout.css';

const HomePage: React.FC = () => {
    return (
        <Layout style={{height: '100vh'}}>
            <Sidebar/>
            <Layout className="account-root-layout">
                <TopBar/>
                <Content className="content-movies">
                    <MoviesGrid
                        apiEndpoint="/api/movies/home"
                        title="Lessons you started!"
                        emptyMessage="You haven't added any movies yet. Start by adding your first movie!"
                        showGenreFilter={true}
                    />
                </Content>
            </Layout>
        </Layout>
    );
};

export default HomePage;