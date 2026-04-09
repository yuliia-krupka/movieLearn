import React, {useEffect, useState} from 'react';
import {Card, Typography, Row, Col, Spin} from 'antd';
import {TeamOutlined, VideoCameraAddOutlined, ArrowRightOutlined, DashboardOutlined} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import {movieService} from '../../services/movieService';
import {userService} from '../../services/userService';
import MainLayout from '../layout/MainLayout.tsx';
import '../layout/Layout.css';
import './AdminDashboard.css';

const {Title, Text} = Typography;
const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({users: 0, movies: 0});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const users = await userService.getAll();
                const movies = await movieService.getAll();

                setStats({users: users.length, movies: movies.length});
            } catch (error) {
                console.error('Failed to fetch dashboard stats', error);
            } finally {
                setLoading(false);
            }
        };

        void fetchStats();
    }, []);

    return (
        <MainLayout contentStyle={{padding: '32px', alignItems: 'flex-start', backgroundColor: '#fff'}}>
            <div className="dashboard-header">
                <Title level={2} className="dashboard-title">
                    <DashboardOutlined/> Dashboard
                </Title>
                <Text className="dashboard-subtitle">Overview of your application's performance and
                    content.</Text>
            </div>

            {loading ? (
                <div className="dashboard-loading-container">
                    <Spin size="large"/>
                </div>
            ) : (
                <Row gutter={[24, 24]} className="dashboard-full-width">
                    <Col xs={24} sm={24} md={12} lg={8}>
                        <Card
                            className="stat-card"
                            onClick={() => navigate('/admin/users')}
                        >
                            <div className="action-arrow"><ArrowRightOutlined/></div>
                            <div className="stat-icon-wrapper icon-users">
                                <TeamOutlined/>
                            </div>
                            <div className="stat-title">Total Users</div>
                            <div className="stat-value">{stats.users}</div>
                            <div className="stat-description">Manage user roles and accounts</div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={24} md={12} lg={8}>
                        <Card
                            className="stat-card"
                            onClick={() => navigate('/admin/movies')}
                        >
                            <div className="action-arrow"><ArrowRightOutlined/></div>
                            <div className="stat-icon-wrapper icon-movies">
                                <VideoCameraAddOutlined/>
                            </div>
                            <div className="stat-title">Total Movies</div>
                            <div className="stat-value">{stats.movies}</div>
                            <div className="stat-description">Manage movies</div>
                        </Card>
                    </Col>
                </Row>
            )}
        </MainLayout>
    );
};

export default AdminDashboard;
