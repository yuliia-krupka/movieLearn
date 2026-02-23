import React, {type ReactNode, type CSSProperties} from 'react';
import {Layout} from 'antd';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import '../css/Layout.css';

const {Content} = Layout;

interface MainLayoutProps {
    children: ReactNode;
    className?: string;
    contentStyle?: CSSProperties;
    fullHeight?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
                                                   children,
                                                   className = 'content',
                                                   contentStyle,
                                                   fullHeight = false
                                               }) => {
    return (
        <Layout className={`account-root-layout ${fullHeight ? 'fixed-layout' : ''}`}>
            <Sidebar/>
            <Layout>
                <TopBar/>
                <Content className={className} style={{...contentStyle, ...(fullHeight ? {overflowY: 'auto'} : {})}}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
