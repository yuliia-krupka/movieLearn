import React, {useEffect, useState} from "react";
import {Layout, Avatar, Typography, Input, message as antMessage, Button, Tooltip} from "antd";
import {useNavigate} from "react-router-dom";
import {DashboardOutlined} from "@ant-design/icons";
import "../css/TopBar.css";
import axios from "axios";

const {Header} = Layout;
const {Text} = Typography;
const {Search} = Input;

interface User {
    id: number;
    name?: string;
    lastname?: string;
    photo?: string;
    role?: string;
}

const TopBar: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [message, contextHolder] = antMessage.useMessage();

    useEffect(() => {
        axios.get<User>('/api/users/account', {withCredentials: true})
            .then(res => setUser(res.data))
            .catch(error => console.log("ERROR OCCURRED: " + error))
    }, []);

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
                    style={{maxWidth: 240}}
                    allowClear
                />

                {user?.role === 'ADMIN' && (
                    <Tooltip title="Admin Dashboard">
                        <Button
                            type="text"
                            icon={<DashboardOutlined style={{fontSize: '18px'}}/>}
                            onClick={() => navigate('/admin')}
                            className="admin-dashboard-btn"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: '#595959',
                                fontWeight: 500
                            }}
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