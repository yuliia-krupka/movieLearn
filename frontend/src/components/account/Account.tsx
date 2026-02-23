import {useState} from "react";
import axios from "axios";
import {Avatar, Button, Card, Space, Typography, Spin, Alert} from "antd";
import {EditOutlined} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";

import MainLayout from "../layout/MainLayout.tsx";
import {useUserProfile} from "../hooks/useUserProfile.ts";
import {useAuth} from "../auth/useAuth.tsx";
import '../css/Account.css';
import '../css/Layout.css'

const {Title, Text} = Typography;


const Account = () => {
    const {isAdmin} = useAuth();
    const {user, loading: userLoading, error, fetchUserProfile} = useUserProfile();
    const [moviesStarted, setMoviesStarted] = useState<number>(0);
    const navigate = useNavigate();

    useEffect(() => {
        void fetchUserProfile();
    }, [fetchUserProfile]);

    useEffect(() => {
        axios.get('/api/movies/count', {withCredentials: true})
            .then(res => setMoviesStarted(res.data))
            .catch(err => console.error("Failed to fetch movie count:", err));
    }, []);

    if (userLoading) {
        return (
            <MainLayout>
                <div className="account-loading-container">
                    <Spin size="large"/>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout>
                <Alert message="Error" description={error} type="error" showIcon/>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="profile-container">
                <div className="profile-header">
                    <Avatar
                        src={user ? `/api/users/photo/${user.id}` : undefined}
                        size={80}
                        alt={user ? `${user.name} ${user.lastname}` : 'User avatar'}
                    />
                    <Title level={4} className='naming' style={{marginBottom: isAdmin ? 4 : undefined}}>
                        {user ? `${user.name} ${user.lastname}` : 'Loading...'}
                    </Title>
                    {isAdmin && (
                        <div className="admin-badge">Admin</div>
                    )}
                </div>

                <Card className="profile-card">
                    <Space direction="vertical" size="large" className="account-space">
                        <ProfileDetail label="Email:" value={user?.email || "Not available"}/>
                        {!isAdmin && (
                            <>
                                <ProfileDetail label="English level:" value={user?.englishLevel || "Not set"}/>
                                <ProfileDetail label="Movies started:" value={moviesStarted}/>

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
                            </>
                        )}

                        {isAdmin && (
                            <div className="admin-info-text">
                                As an administrator, your primary role is to monitor users, manage the
                                application's movie and genre catalog. You can add, edit, or delete movies/genres from
                                the Admin
                                Dashboard. Also delete users or make them admin as well.
                            </div>
                        )}

                        <Button
                            className="update-profile-btn"
                            icon={<EditOutlined/>}
                            onClick={() => navigate("/account/update")}
                        >
                            Update Profile
                        </Button>
                    </Space>
                </Card>
            </div>
        </MainLayout>
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
