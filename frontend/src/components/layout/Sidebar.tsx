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

                <Button
                    type="primary"
                    icon={<LogoutOutlined/>}
                    className="sidebar-logout"
                    onClick={handleLogout}
                >
                    Log Out
                </Button>
            </div>
        </Sider>
    );
};

export default Sidebar;
