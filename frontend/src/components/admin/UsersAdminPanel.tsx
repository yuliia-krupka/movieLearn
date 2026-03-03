import React, {useEffect, useState} from 'react';
import {
    Avatar,
    Input,
    List,
    message as antMessage,
    Button,
    Select,
    Space,
    Modal,
    Tag,
    Typography
} from 'antd';
import {DeleteOutlined, UserOutlined} from '@ant-design/icons';
import MainLayout from "../layout/MainLayout.tsx";
import {useAuth} from "../auth/useAuth.tsx";
import type {User} from "../../types/auth";
import {useAdminUsers} from "../hooks/useAdminUsers.ts";
import './UsersPanel.css';

const {Text} = Typography;
const {Option} = Select;
const {Search} = Input;

const roleColors: Record<string, string> = {
    ADMIN: 'red',
    USER: 'blue'
};

const UserList: React.FC = () => {
    const [message, contextHolder] = antMessage.useMessage();
    const {user: currentUser} = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    const {users, loading, actionLoading, fetchUsers, updateUserRole, deleteUser} = useAdminUsers(message);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            void fetchUsers(searchTerm);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, fetchUsers]);

    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            await updateUserRole(userId, newRole);
        } catch (error) {
            console.error('Failed to change user role:', error);
        }
    };

    const handleDeleteUser = (user: User) => {
        Modal.confirm({
            title: 'Delete User',
            content: `Are you sure you want to delete ${user.name} ${user.lastname}?`,
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await deleteUser(user.id);
                } catch (error) {
                    console.error('Error deleting user:', error);
                }
            }
        });
    };

    return (
        <MainLayout className="content-movies" contentStyle={{padding: '24px'}}>
            {contextHolder}
            <div className="userList-container">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
                    <h2 className="userList-title" style={{marginBottom: 0}}>User Management</h2>
                    <Search
                        placeholder="Search by email"
                        allowClear
                        enterButton
                        onSearch={(value) => setSearchTerm(value)}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{width: 300}}
                    />
                </div>
                <List
                    loading={loading}
                    itemLayout="horizontal"
                    dataSource={users}
                    locale={{emptyText: 'No users found'}}
                    renderItem={(user: User) => {
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
                                            style={{minWidth: 100}}
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
                                            src={user.photo ? `/api/users/photo/${user.id}` : undefined}
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
        </MainLayout>
    );
};

export default UserList;