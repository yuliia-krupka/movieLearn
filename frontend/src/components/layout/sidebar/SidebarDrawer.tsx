import React from "react";
import {Button, Drawer, Menu, Typography, message as antMessage} from "antd";
import {
    CloseOutlined,
    LogoutOutlined,
} from "@ant-design/icons";
import {useNavigate, useLocation} from "react-router-dom";
import {getMenuItems} from "./Menu.tsx";

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

    const items = getMenuItems(navigate, isAdmin, (msg: string) => messageApi.error(msg), onClose);

    const handleLogout = () => {
        window.location.href = "http://localhost:8080/logout";
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
                        <Button
                            type="text"
                            icon={<CloseOutlined/>}
                            onClick={onClose}
                            className="drawer-close-button"
                        />
                    </div>

                    <div className="drawer-menu-container">
                        <Menu mode="vertical" selectedKeys={[location.pathname]} items={items}/>
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
