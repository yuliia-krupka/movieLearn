import React, {useEffect, useState} from 'react';
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
import axios from 'axios';
import Sidebar from "../layout/sidebar/Sidebar.tsx";
import TopBar from "../layout/topbar/TopBar.tsx";
import {Content} from "antd/es/layout/layout";
import {useAuth} from "../auth/useAuth.tsx";

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

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        setLoading(true);
        axios.get<User[]>('http://localhost:8080/api/users', {withCredentials: true})
            .then(({data}) => {
                const sorted = data.slice().sort((a, b) => {
                    return (rolePriority[a.role?.toUpperCase()] || 99) - (rolePriority[b.role?.toUpperCase()] || 99);
                });
                setUsers(sorted);
            })
            .catch((error) => {
                console.error('Failed to load users:', error);

                if (error.response?.status === 403) {
                    message.error('Access denied. Admin privileges required.');
                } else if (error.response?.status === 401) {
                    message.error('Please log in to access this page.');
                } else {
                    message.error('Failed to load users');
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleRoleChange = async (userId: number, newRole: string) => {
        setActionLoading(prev => ({...prev, [userId]: true}));

        try {
            const url = `http://localhost:8080/api/users/${userId}/role/${newRole}`;
            console.log('Making request to:', url);

            await axios.put(
                url,
                null,
                {
                    withCredentials: true
                }
            );

            message.success('User role updated successfully');
            fetchUsers();
        } catch (error) {
            console.error('Failed to update role:', error);

            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response: { status: number; data?: string } };
                if (axiosError.response?.status === 403) {
                    message.error(axiosError.response.data || 'Permission denied');
                } else if (axiosError.response?.status === 404) {
                    message.error('User not found');
                } else if (axiosError.response?.status === 500) {
                    message.error('Server error. Please try again.');
                } else {
                    message.error('Failed to update user role');
                }
            } else {
                message.error('Failed to update user role');
            }
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
                    await axios.delete(`http://localhost:8080/api/users/${user.id}`, {
                        withCredentials: true
                    });

                    message.success('User deleted successfully');
                    fetchUsers();
                } catch (error) {
                    console.error('Failed to delete user:', error);

                    if (error && typeof error === 'object' && 'response' in error) {
                        const axiosError = error as { response: { status: number; data?: string } };
                        if (axiosError.response?.status === 403) {
                            message.error(axiosError.response.data || 'You cannot delete this user');
                        } else if (axiosError.response?.status === 404) {
                            message.error('User not found');
                        } else if (axiosError.response?.status === 500) {
                            message.error('Server error. Please try again.');
                        } else {
                            message.error('Failed to delete user');
                        }
                    } else {
                        message.error('Failed to delete user');
                    }
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
                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px'}}>
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
                    <div style={{
                        background: '#fff',
                        padding: '24px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{marginBottom: '24px', fontSize: '24px', fontWeight: '600'}}>User Management</h2>

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
                                        style={{
                                            padding: '16px 0',
                                            borderBottom: '1px solid #f0f0f0'
                                        }}
                                        actions={canEdit ? [
                                            <Space key="actions" size="middle">
                                                <Select
                                                    value={user.role}
                                                    style={{width: 100}}
                                                    loading={actionLoading[user.id]}
                                                    onChange={(newRole) => handleRoleChange(user.id, newRole)}
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
                                                    onClick={() => handleDeleteUser(user)}
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
                                                    style={{
                                                        backgroundColor: !user.photo ? '#1890ff' : undefined
                                                    }}
                                                />
                                            }
                                            title={
                                                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                    <span style={{fontSize: '16px', fontWeight: '500'}}>
                                                        {user.name} {user.lastname}
                                                    </span>
                                                    <Tag color={roleColors[user.role] || 'default'}
                                                         style={{fontSize: '11px'}}>
                                                        {user.role}
                                                    </Tag>
                                                    {isCurrentUser && (
                                                        <Tag color="green" style={{fontSize: '10px'}}>
                                                            YOU
                                                        </Tag>
                                                    )}
                                                </div>
                                            }
                                            description={
                                                <div style={{marginTop: '4px'}}>
                                                    <Text type="secondary" style={{fontSize: '14px'}}>
                                                        {user.email}
                                                    </Text>
                                                </div>
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