import React, {useState} from "react";
import {Layout, Menu, Button, Grid, message as antMessage, Typography} from "antd";
import {
    LogoutOutlined,
    MenuOutlined,
} from "@ant-design/icons";
import {useNavigate, useLocation} from "react-router-dom";
import SidebarDrawer from "./SidebarDrawer.tsx";

import "./Sidebar.css";
import {getMenuItems} from "./Menu.tsx";
import {useAuth} from "../auth/useAuth.tsx";

const {Sider} = Layout;
const {Title} = Typography;
const {useBreakpoint} = Grid;

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const screens = useBreakpoint();
    const [messageApi, contextHolder] = antMessage.useMessage();
    const {isAdmin, logout} = useAuth();

    const handleLogout = () => {
        logout();
    };

    const items = getMenuItems(navigate, isAdmin, (msg: string) => messageApi.error(msg));

    if (!screens.md) {
        return (
            <>
                <Button
                    type="text"
                    icon={<MenuOutlined/>}
                    onClick={() => setDrawerVisible(true)}
                    className={`sidebar-menu-button ${drawerVisible ? 'hidden' : ''}`}
                    aria-label="Open navigation menu"
                />
                <SidebarDrawer
                    open={drawerVisible}
                    onClose={() => setDrawerVisible(false)}
                    isAdmin={isAdmin}
                    messageApi={messageApi}
                />
                {contextHolder}
            </>
        );
    }

    return (
        <Sider className="sidebar" width={200}>
            {contextHolder}
            <div className="sidebar-content">
                <div className="sidebar-container">
                    <Title level={4} className="sidebar-title">
                        <span className="sidebar-title-movie">MOVIE</span>
                        <span className="sidebar-title-learn">LEARN</span>
                    </Title>

                    <Menu
                        mode="vertical"
                        selectedKeys={[location.pathname]}
                        items={items}
                    />
                </div>

                <div className="sidebar-bottom-actions" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                    <Button
                        type="primary"
                        icon={<LogoutOutlined/>}
                        className="sidebar-logout"
                        onClick={handleLogout}
                    >
                        Log Out
                    </Button>
                    <div className="tmdb-attribution" style={{
                        textAlign: 'center',
                        fontSize: '9px',
                        color: 'rgba(0, 0, 0, 0.45)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '0 10px',
                        marginTop: '12px'
                    }}>
                        <img
                            src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
                            alt="TMDB Logo" style={{height: '10px', opacity: 0.8}}/>
                        <span>This product uses the TMDB API but is not endorsed or certified by TMDB.</span>
                    </div>
                </div>
            </div>
        </Sider>
    );
};

export default Sidebar;
