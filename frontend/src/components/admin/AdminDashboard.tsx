import React, { useEffect, useState } from 'react';
import { Layout, Card, Typography, Row, Col, Spin } from 'antd';
import { TeamOutlined, VideoCameraAddOutlined, ArrowRightOutlined, DashboardOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../layout/Sidebar.tsx';
import TopBar from '../layout/TopBar.tsx';
import { Content } from 'antd/es/layout/layout';
import '../css/Layout.css';
import '../css/AdminDashboard.css';

const { Title, Text } = Typography;
const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ users: 0, movies: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const usersRes = await axios.get('/api/users', { withCredentials: true });
                const usersCount = Array.isArray(usersRes.data) ? usersRes.data.length : 0;

                const moviesRes = await axios.get('/api/movies', { withCredentials: true });
                const moviesCount = Array.isArray(moviesRes.data) ? moviesRes.data.length : 0;

                setStats({ users: usersCount, movies: moviesCount });
            } catch (error) {
                console.error('Failed to fetch dashboard stats', error);
            } finally {
                setLoading(false);
            }
        };

        void fetchStats();
    }, []);

    return (
        <Layout>
            <Sidebar />
            <Layout className="account-root-layout">
                <TopBar />
                <Content className="content"
                    style={{ padding: '32px', alignItems: 'flex-start', backgroundColor: '#fff' }}>
                    <div className="dashboard-header" style={{ textAlign: 'left', width: '100%' }}>
                        <Title level={2} className="dashboard-title">
                            <DashboardOutlined /> Dashboard
                        </Title>
                        <Text className="dashboard-subtitle">Overview of your application's performance and
                            content.</Text>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px', width: '100%' }}>
                            <Spin size="large" />
                        </div>
                    ) : (
                        <Row gutter={[24, 24]} style={{ width: '100%' }}>
                            <Col xs={24} sm={24} md={12} lg={8}>
                                <Card
                                    className="stat-card"
                                    onClick={() => navigate('/admin/users')}
                                >
                                    <div className="action-arrow"><ArrowRightOutlined /></div>
                                    <div className="stat-icon-wrapper icon-users">
                                        <TeamOutlined />
                                    </div>
                                    <div className="stat-title">Total Users</div>
                                    <div className="stat-value">{stats.users}</div>
                                    <div className="stat-description">Manage user roles and accounts</div>
                                </Card>
                            </Col>

                            <Col xs={24} sm={24} md={12} lg={8}>
                                <Card
                                    className="stat-card"
                                    onClick={() => navigate('/admin/movies/new')}
                                >
                                    <div className="action-arrow"><ArrowRightOutlined /></div>
                                    <div className="stat-icon-wrapper icon-movies">
                                        <VideoCameraAddOutlined />
                                    </div>
                                    <div className="stat-title">Total Movies</div>
                                    <div className="stat-value">{stats.movies}</div>
                                    <div className="stat-description">Add and manage video content</div>
                                </Card>
                            </Col>
                        </Row>
                    )}
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminDashboard;
