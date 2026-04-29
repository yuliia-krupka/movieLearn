import React from "react";
import {Layout, Avatar, Typography, Input, message as antMessage} from "antd";
import {useNavigate, useLocation} from "react-router-dom";
import "./TopBar.css";
import {useAuth} from "../auth/useAuth";

const {Header} = Layout;
const {Text} = Typography;
const {Search} = Input;

const TopBar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {user} = useAuth();
    const [messageApi, contextHolder] = antMessage.useMessage();

    const onSearch = async (value: string) => {
        const isAdminPath = location.pathname.startsWith('/admin');
        const targetPath = isAdminPath ? "/admin/movies" : "/home";

        if (!value.trim()) {
            navigate(targetPath);
            return;
        }

        try {
            navigate(`${targetPath}?search=${encodeURIComponent(value)}`);
        } catch (error) {
            messageApi.error("Error during searching");
            console.error("Error during searching:", error);
        }
    };

    return (
        <Header className="topbar">
            {contextHolder}
            <div className="topbar-right">
                <Search
                    placeholder="Search movie cards..."
                    onSearch={onSearch}
                    enterButton
                    className="topbar-search"
                    allowClear
                    aria-label="Search movie cards"
                />

                <div className="topbar-user">
                    <Avatar
                        size="small"
                        src={user ? `/api/users/photo/${user.id}` : undefined}
                        className="topbar-avatar"
                        onClick={() => navigate("/account")}
                        style={{cursor: 'pointer'}}
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