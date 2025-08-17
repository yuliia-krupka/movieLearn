import React, {useEffect, useState, useCallback} from 'react';
import {
    Avatar,
    List,
    Spin,
    Layout,
    message as antMessage,
    Button,
    Select,
    Space,
    Modal,
    Tag,
    Typography
} from 'antd';
import {DeleteOutlined, UserOutlined} from '@ant-design/icons';
import axios, {AxiosError} from 'axios';
import Sidebar from "./layout/Sidebar.tsx";
import TopBar from "./layout/TopBar.tsx";
import {Content} from "antd/es/layout/layout";
import {useAuth} from "./auth/useAuth.tsx";
import './css/UsersPanel.css';

const {Text} = Typography;
const {Option} = Select;

type User = {
    id: number;
    name: string;
    lastname: string;
    email: string;
    photo?: string;
    role: string;
};

const rolePriority: Record<string, number> = {
    ADMIN: 1,
    USER: 2
};

const roleColors: Record<string, string> = {
    ADMIN: 'red',
    USER: 'blue'
};

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({});
    const [message, contextHolder] = antMessage.useMessage();
    const {user: currentUser} = useAuth();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const {data} = await axios.get<User[]>('http://localhost:8080/api/users', {withCredentials: true});
            const sorted = data.slice().sort((a, b) => (rolePriority[a.role?.toUpperCase()] || 99) - (rolePriority[b.role?.toUpperCase()] || 99));
            setUsers(sorted);
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            if (axiosError.response?.status === 403) {
                message.error(axiosError.response.data?.message || 'Access denied. Admin privileges required.');
            } else if (axiosError.response?.status === 401) {
                message.error('Please log in to access this page.');
            } else {
                message.error('Failed to load users');
            }
        } finally {
            setLoading(false);
        }
    }, [message]);

    useEffect(() => {
        void fetchUsers(); // Promise явно ігноруємо для useEffect
    }, [fetchUsers]);

    const handleRoleChange = async (userId: number, newRole: string) => {
        setActionLoading(prev => ({...prev, [userId]: true}));
        try {
            await axios.put(`http://localhost:8080/api/users/${userId}/role/${newRole}`, null, {withCredentials: true});
            message.success('User role updated successfully');
            await fetchUsers();
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            message.error(axiosError.response?.data?.message || 'Failed to update user role');
        } finally {
            setActionLoading(prev => ({...prev, [userId]: false}));
        }
    };

    const handleDeleteUser = (user: User) => {
        Modal.confirm({
            title: 'Delete User',
            content: (
                <div>
                    <p>Are you sure you want to delete this user?</p>
                    <p><strong>{user.name} {user.lastname}</strong></p>
                    <p><Text type="secondary">{user.email}</Text></p>
                </div>
            ),
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                setActionLoading(prev => ({...prev, [user.id]: true}));
                try {
                    await axios.delete(`http://localhost:8080/api/users/${user.id}`, {withCredentials: true});
                    message.success('User deleted successfully');
                    await fetchUsers();
                } catch (error) {
                    const axiosError = error as AxiosError<{ message?: string }>;
                    message.error(axiosError.response?.data?.message || 'Failed to delete user');
                } finally {
                    setActionLoading(prev => ({...prev, [user.id]: false}));
                }
            }
        });
    };

    if (loading) {
        return (
            <Layout>
                <Sidebar/>
                <Layout className="account-root-layout">
                    <TopBar/>
                    <Content className="content">
                        <div className="spinner-container">
                            <Spin size="large"/>
                        </div>
                    </Content>
                </Layout>
            </Layout>
        );
    }

    return (
        <Layout>
            <Sidebar/>
            <Layout className="account-root-layout">
                <TopBar/>
                {contextHolder}
                <Content className="content-movies" style={{padding: '24px'}}>
                    <div className="userList-container">
                        <h2 className="userList-title">User Management</h2>
                        <List
                            itemLayout="horizontal"
                            dataSource={users}
                            locale={{emptyText: 'No users found'}}
                            renderItem={(user) => {
                                const isCurrentUser = user.id === currentUser?.id;
                                const isUserAdmin = user.role.toUpperCase() === 'ADMIN';
                                const canEdit = !isCurrentUser && !isUserAdmin;

                                return (
                                    <List.Item
                                        className="list-item"
                                        actions={canEdit ? [
                                            <Space key="actions" size="middle" className="list-item-actions">
                                                <Select
                                                    value={user.role}
                                                    loading={actionLoading[user.id]}
                                                    onChange={(newRole) => void handleRoleChange(user.id, newRole)}
                                                    size="small"
                                                >
                                                    <Option value="USER">USER</Option>
                                                    <Option value="ADMIN">ADMIN</Option>
                                                </Select>

                                                <Button
                                                    type="text"
                                                    danger
                                                    size="small"
                                                    icon={<DeleteOutlined/>}
                                                    loading={actionLoading[user.id]}
                                                    onClick={() => void handleDeleteUser(user)}
                                                    style={{color: '#ff4d4f'}}
                                                >
                                                    Delete
                                                </Button>
                                            </Space>
                                        ] : []}
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar
                                                    size={48}
                                                    src={user.photo ? `http://localhost:8080/api/users/photo/${user.id}` : undefined}
                                                    icon={!user.photo ? <UserOutlined/> : undefined}
                                                    alt={`${user.name} ${user.lastname}`}
                                                    className={!user.photo ? 'avatar-default' : ''}
                                                />
                                            }
                                            title={
                                                <div className="user-name-tag">
                                                    <span className="user-name">{user.name} {user.lastname}</span>
                                                    <Tag color={roleColors[user.role] || 'default'}
                                                         className="role-tag">
                                                        {user.role}
                                                    </Tag>
                                                    {isCurrentUser && <Tag className="you-tag">YOU</Tag>}
                                                </div>
                                            }
                                            description={
                                                <Text type="secondary" className="user-email">{user.email}</Text>
                                            }
                                        />
                                    </List.Item>
                                );
                            }}
                        />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default UserList;