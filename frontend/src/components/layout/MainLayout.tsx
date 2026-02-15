import React, {type ReactNode, type CSSProperties} from 'react';
import {Layout} from 'antd';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import '../css/Layout.css';

const {Content} = Layout;

interface MainLayoutProps {
    children: ReactNode;
    className?: string;
    messageContext?: ReactNode;
    contentStyle?: CSSProperties;
}

const MainLayout: React.FC<MainLayoutProps> = ({
                                                   children,
                                                   className = 'content',
                                                   messageContext,
                                                   contentStyle
                                               }) => {
    return (
        <Layout className="account-root-layout">
            <Sidebar/>
            <Layout>
                {messageContext}
                <TopBar/>
                <Content className={className} style={contentStyle}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
