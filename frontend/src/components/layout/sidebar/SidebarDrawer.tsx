import React from "react";
import {Button, Drawer, Menu, Typography} from "antd";
import {
    CloseOutlined,
    LogoutOutlined,
    HomeOutlined,
    VideoCameraOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {useNavigate, useLocation} from "react-router-dom";

const {Title} = Typography;

type Props = {
    open: boolean;
    onClose: () => void;
};

const SidebarDrawer: React.FC<Props> = ({open, onClose}) => {
    const navigate = useNavigate();
    const location = useLocation();

    const items = [
        {
            key: '/home',
            icon: <HomeOutlined/>,
            label: 'Home',
            onClick: () => {
                navigate('/home');
                onClose();
            },
        },
        {
            key: '/movies',
            icon: <VideoCameraOutlined/>,
            label: 'Movies List',
            onClick: () => {
                navigate('/movies');
                onClose();
            },
        },
        {
            key: '/account',
            icon: <UserOutlined/>,
            label: 'Account',
            onClick: () => {
                navigate('/account');
                onClose();
            },
        },
        {
            key: '/new-movie',
            icon: <VideoCameraOutlined/>,
            label: 'New Movie',
            onClick: () => navigate('/new-movie'),
        }
    ];

    const handleLogout = () => {
        window.location.href = "http://localhost:8080/logout";
    };

    return (
        <Drawer
            placement="left"
            open={open}
            onClose={onClose}
            closable={false}
            width={200}
            styles={{
                body: {padding: 0},
                mask: {backgroundColor: "rgba(0, 0, 0, 0.5)"}
            }}
        >
            <div className="drawer-content">
                <div>
                    <div className="drawer-header">
                        <Title level={4} className="sidebar-title">
                            <span className="sidebar-title-movie">MOVIE</span>
                            <span className="sidebar-title-learn">LEARN</span>
                        </Title>
                        <Button
                            type="text"
                            icon={<CloseOutlined/>}
                            onClick={onClose}
                            className="drawer-close-button"
                        />
                    </div>

                    <div className="drawer-menu-container">
                        <Menu
                            mode="vertical"
                            selectedKeys={[location.pathname]}
                            items={items}
                        />
                    </div>
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
        </Drawer>
    );
};

export default SidebarDrawer;