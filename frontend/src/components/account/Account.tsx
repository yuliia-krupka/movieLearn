import { useEffect, useState } from "react";
import axios from "axios";
import { Avatar, Button, Card, Layout, Space, Typography } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import Sidebar from "../layout/Sidebar.tsx";
import TopBar from "../layout/TopBar.tsx";
import '../css/Account.css';
import '../css/Layout.css'

const { Content } = Layout;
const { Title, Text } = Typography;

type User = {
    id: number;
    name: string;
    lastname: string;
    interests: string[];
    englishLevel: string;
    email: string;
    photo?: string;
};


const Account = () => {
    const [user, setUser] = useState<User | null>(null);
    const [moviesStarted, setMoviesStarted] = useState<number>(0);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get<User>('/api/users/account', { withCredentials: true })
            .then(res => setUser(res.data))
            .catch(err => console.error("Failed to fetch user account:", err));
    }, []);

    useEffect(() => {
        axios.get('/api/movies/count', { withCredentials: true })
            .then(res => setMoviesStarted(res.data))
            .catch(err => console.error("Failed to fetch movie count:", err));
    }, []);

    return (
        <Layout className="account-root-layout">
            <Sidebar />
            <Layout>
                <TopBar />
                <Content className="content">
                    <div className="profile-container">
                        <div className="profile-header">
                            <Avatar
                                src={user ? `/api/users/photo/${user.id}` : undefined}
                                size={80}
                                alt={user ? `${user.name} ${user.lastname}` : 'User avatar'}
                            />
                            <Title level={4} className='naming'>
                                {user ? `${user.name} ${user.lastname}` : 'Loading...'}
                            </Title>
                        </div>

                        <Card className="profile-card">
                            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                                <ProfileDetail label="Email:" value={user?.email || "Not available"} />
                                <ProfileDetail label="English level:" value={user?.englishLevel || "Not set"} />
                                <ProfileDetail label="Movies started:" value={moviesStarted} />

                                <div className="profile-detail">
                                    <Text className="profile-label">Interests:</Text>
                                    <div className="interests-badges">
                                        {Array.isArray(user?.interests) && user.interests.length > 0 ? (
                                            user.interests.map((interest, idx) => (
                                                <span key={idx} className="interest-badge-yellow">
                                                    {interest}
                                                </span>
                                            ))
                                        ) : (
                                            <Text>Not set</Text>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    className="update-profile-btn"
                                    icon={<EditOutlined />}
                                    onClick={() => navigate("/account/update")}
                                >
                                    Update Profile
                                </Button>
                            </Space>
                        </Card>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};


const ProfileDetail = ({
    label, value
}: { label: string; value: string | number }) => (
    <div className="profile-detail">
        <Text className="profile-label">{label}</Text>
        <Text>{value}</Text>
    </div>
);

export default Account;
