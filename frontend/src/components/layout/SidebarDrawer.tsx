import React from "react";
import {Button, Drawer, Menu, Typography, message as antMessage, Avatar} from "antd";
import {
    LogoutOutlined,
    UserOutlined
} from "@ant-design/icons";
import {useNavigate, useLocation} from "react-router-dom";
import {getMenuItems} from "./Menu.tsx";
import {useAuth} from "../auth/useAuth.tsx";

const {Title} = Typography;

type Props = {
    open: boolean;
    onClose: () => void;
    isAdmin: boolean;
    messageApi: ReturnType<typeof antMessage.useMessage>[0];
};

const SidebarDrawer: React.FC<Props> = ({open, onClose, isAdmin, messageApi}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const {user, logout} = useAuth();

    const items = getMenuItems(navigate, isAdmin, (msg: string) => messageApi.error(msg), onClose);

    const handleLogout = () => {
        logout();
    };

    return (
        <Drawer
            placement="left"
            open={open}
            onClose={onClose}
            closable={false}
        >
            <div className="drawer-content">
                <div>
                    <div className="drawer-header">
                        <Title level={4} className="sidebar-title">
                            <span className="sidebar-title-movie">MOVIE</span>
                            <span className="sidebar-title-learn">LEARN</span>
                        </Title>
                        <Avatar
                            size={48}
                            src={user?.photo ? `/api/users/photo/${user.id}` : undefined}
                            icon={!user?.photo && <UserOutlined/>}
                            className="sidebar-avatar"
                        />
                    </div>

                    <div className="drawer-menu-container">
                        <Menu mode="vertical" selectedKeys={[location.pathname]} items={items}/>
                    </div>
                </div>

                <div className="sidebar-bottom-actions"
                     style={{display: 'flex', flexDirection: 'column', gap: '16px', marginTop: 'auto'}}>
                    <Button
                        type="primary"
                        icon={<LogoutOutlined/>}
                        className="sidebar-logout"
                        onClick={handleLogout}
                    >
                        Log Out
                    </Button>
                </div>
            </div>
        </Drawer>
    );
};

export default SidebarDrawer;
