import React, { useState } from 'react';
import { Form, Select, Button, Popconfirm, Input, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { type Genre } from '../types/movies.ts';
import axios from 'axios';
import type useMessage from "antd/es/message/useMessage";
import '../css/GenreSelector.css';

const { Option } = Select;

interface GenreSelectorProps {
    genres: Genre[];
    onAddGenre: () => void;
    onGenreDeleted?: () => void;
    onGenreUpdated?: () => void;
    messageApi: ReturnType<typeof useMessage>[0];
}

const GenreSelector: React.FC<GenreSelectorProps> = ({
    genres,
    onAddGenre,
    onGenreDeleted,
    onGenreUpdated,
    messageApi
}) => {
    const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editForm] = Form.useForm();

    const handleDeleteGenre = async (genreId: number, genreName: string) => {
        try {
            await axios.delete(`/api/genres/${genreId}`);
            messageApi.success(`Genre "${genreName}" deleted successfully`);
            onGenreDeleted?.();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.error ||
                    error.response?.data ||
                    `Failed to delete genre "${genreName}"`;
                messageApi.error(errorMessage);
            } else {
                messageApi.error(`Unexpected error while deleting genre "${genreName}"`);
            }
        }
    };

    const handleEditGenre = (genre: Genre) => {
        setEditingGenre(genre);
        setEditModalVisible(true);
        editForm.setFieldsValue({ name: genre.name });
    };

    const handleUpdateGenre = async () => {
        try {
            const values = await editForm.validateFields();
            const updatedName = values.name.trim();

            if (!updatedName) {
                messageApi.error('Genre name cannot be empty');
                return;
            }

            if (updatedName === editingGenre?.name) {
                messageApi.info('No changes made');
                setEditModalVisible(false);
                return;
            }

            await axios.put(`/api/genres/${editingGenre?.id}`, {
                name: updatedName
            });

            messageApi.success(`Genre updated successfully`);
            setEditModalVisible(false);
            setEditingGenre(null);
            editForm.resetFields();
            onGenreUpdated?.();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.error ||
                    error.response?.data ||
                    'Failed to update genre';
                messageApi.error(errorMessage);
            } else {
                messageApi.error('Unexpected error while updating genre');
            }
        }
    };

    const handleModalCancel = () => {
        setEditModalVisible(false);
        setEditingGenre(null);
        editForm.resetFields();
    };

    return (
        <>
            <Form.Item
                label={
                    <div className="genre-selector-label">
                        <span>Genres</span>
                        <Button
                            className='yellow-btn add-genre-btn'
                            icon={<PlusOutlined />}
                            size="small"
                            onClick={onAddGenre}
                        >
                            Add Genre
                        </Button>
                    </div>
                }
                name="genres"
                rules={[{ required: true, message: 'Please select genres' }]}
            >
                <Select
                    mode="multiple"
                    placeholder="Select genres"
                    style={{ width: '100%' }}
                    maxTagCount="responsive"
                >
                    {genres.map((genre) => (
                        <Option key={genre.id} value={genre.name}>
                            <div className="genre-option-container">
                                <span>{genre.name}</span>
                                <div className="genre-actions">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<EditOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditGenre(genre);
                                        }}
                                        className="genre-edit-btn"
                                    />
                                    <Popconfirm
                                        title="Delete Genre"
                                        description={`Are you sure you want to delete "${genre.name}"?`}
                                        onConfirm={(e) => {
                                            e?.stopPropagation();
                                            handleDeleteGenre(genre.id, genre.name);
                                        }}
                                        onCancel={(e) => e?.stopPropagation()}
                                        okText="Yes"
                                        cancelText="No"
                                        placement="left"
                                    >
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                            className="genre-delete-btn"
                                        />
                                    </Popconfirm>
                                </div>
                            </div>
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            <Modal
                title="Edit Genre"
                open={editModalVisible}
                onOk={handleUpdateGenre}
                onCancel={handleModalCancel}
                okText="Update"
                cancelText="Cancel"
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    name="edit-genre-form"
                >
                    <Form.Item
                        name="name"
                        label="Genre Name"
                        rules={[
                            { required: true, message: 'Please enter genre name' },
                            { min: 2, message: 'Genre name must be at least 2 characters' },
                            { max: 50, message: 'Genre name must not exceed 50 characters' },
                            {
                                pattern: /^[A-Za-z\s]+$/,
                                message: 'Genre name must contain only English letters and spaces'
                            }
                        ]}
                    >
                        <Input
                            placeholder="Enter genre name"
                            autoFocus
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default GenreSelector;