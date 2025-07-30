import React, {useState} from "react";
import {Layout, Menu, Button, Typography, Grid} from "antd";
import {
    UserOutlined,
    LogoutOutlined,
    HomeOutlined,
    VideoCameraOutlined,
    MenuOutlined
} from "@ant-design/icons";
import {useNavigate, useLocation} from "react-router-dom";
import SidebarDrawer from "./SidebarDrawer.tsx";
import "./Sidebar.css";

const {Sider} = Layout;
const {Title} = Typography;
const {useBreakpoint} = Grid;

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const screens = useBreakpoint();

    const handleLogout = () => {
        window.location.href = "http://localhost:8080/logout";
    };

    const items = [
        {
            key: '/home',
            icon: <HomeOutlined/>,
            label: 'Home',
            onClick: () => navigate('/home'),
        },
        {
            key: '/movies',
            icon: <VideoCameraOutlined/>,
            label: 'Movies List',
            onClick: () => navigate('/movies'),
        },
        {
            key: '/account',
            icon: <UserOutlined/>,
            label: 'Account',
            onClick: () => navigate('/account'),
        },
        {
            key: '/new-movie',
            icon: <VideoCameraOutlined/>,
            label: 'New Movie',
            onClick: () => navigate('/new-movie'),
        }
    ];

    if (!screens.md) {
        return (
            <>
                <Button
                    type="text"
                    icon={<MenuOutlined/>}
                    onClick={() => setDrawerVisible(true)}
                    className="sidebar-menu-button"
                    style={{
                        display: drawerVisible ? 'none' : 'block'
                    }}
                />
                <SidebarDrawer open={drawerVisible} onClose={() => setDrawerVisible(false)}/>
            </>
        );
    }

    return (
        <Sider className="sidebar" width={200}>
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