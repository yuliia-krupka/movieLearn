import React from "react";
import {Layout, Avatar, Typography, Input, message as antMessage, Button, Tooltip} from "antd";
import {useNavigate} from "react-router-dom";
import {DashboardOutlined} from "@ant-design/icons";
import "../css/TopBar.css";
import {useAuth} from "../auth/useAuth";

const {Header} = Layout;
const {Text} = Typography;
const {Search} = Input;

const TopBar: React.FC = () => {
    const navigate = useNavigate();
    const {user} = useAuth();
    const [message, contextHolder] = antMessage.useMessage();

    const onSearch = async (value: string) => {
        if (!value.trim()) {
            navigate("/movies");
            return;
        }

        try {
            navigate(`/movies?search=${encodeURIComponent(value)}`);
        } catch (error) {
            message.error("Error during searching");
            console.error("Error during searching:", error);
        }
    };

    return (
        <Header className="topbar">
            {contextHolder}
            <div className="topbar-right">
                <Search
                    placeholder="Search movies..."
                    onSearch={onSearch}
                    enterButton
                    className="topbar-search"
                    allowClear
                />

                {user?.role === 'ADMIN' && (
                    <Tooltip title="Admin Dashboard">
                        <Button
                            type="text"
                            icon={<DashboardOutlined className="admin-dashboard-icon"/>}
                            onClick={() => navigate('/admin')}
                            className="admin-dashboard-btn"
                        >
                            Admin
                        </Button>
                    </Tooltip>
                )}

                <div className="topbar-user">
                    <Avatar
                        size="small"
                        src={user ? `/api/users/photo/${user.id}` : undefined}
                        className="topbar-avatar"
                    >
                        {!user?.photo && (user?.name?.[0] || '?')}
                    </Avatar>
                    <Text
                        strong
                        className="topbar-username"
                        onClick={() => navigate("/account")}
                    >
                        {user?.name} {user?.lastname}
                    </Text>
                </div>
            </div>
        </Header>
    );
};
export default TopBar;