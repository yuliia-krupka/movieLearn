import React, {useState} from 'react';
import {Form, Select, Button, Input, Modal} from 'antd';
import {PlusOutlined} from '@ant-design/icons';
import {type Genre} from '../../types/genre';
import GenreOptionItem from './GenreOptionItem';
import axios from 'axios';
import type useMessage from "antd/es/message/useMessage";
import './GenreSelector.css';

interface GenreSelectorProps {
    genres: Genre[];
    onAddGenre: () => void;
    onGenreDeleted?: () => void;
    onGenreUpdated?: () => void;
    messageApi: ReturnType<typeof useMessage>[0];
    excludeMovieId?: number;
}

const GenreSelector: React.FC<GenreSelectorProps> = ({
                                                         genres,
                                                         onAddGenre,
                                                         onGenreDeleted,
                                                         onGenreUpdated,
                                                         messageApi,
                                                         excludeMovieId
                                                     }) => {
    const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editForm] = Form.useForm();

    const handleDeleteGenre = async (genreId: number, genreName: string) => {
        try {
            const url = excludeMovieId
                ? `/api/genres/${genreId}?excludeMovieId=${excludeMovieId}`
                : `/api/genres/${genreId}`;
            await axios.delete(url, {withCredentials: true});
            messageApi.success(`Genre "${genreName}" deleted successfully`);
            onGenreDeleted?.();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const data = error.response?.data;
                const errorMessage = (data && typeof data === 'object' && 'message' in data)
                    ? (data as { message: string }).message
                    : (typeof data === 'string' ? data : `Failed to delete genre "${genreName}"`);
                messageApi.error(errorMessage);
            } else {
                messageApi.error(`Unexpected error while deleting genre "${genreName}"`);
            }
        }
    };

    const handleEditGenre = (genre: Genre) => {
        setEditingGenre(genre);
        setEditModalVisible(true);
        editForm.setFieldsValue({name: genre.name});
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
            }, {withCredentials: true});

            messageApi.success(`Genre updated successfully`);
            setEditModalVisible(false);
            setEditingGenre(null);
            editForm.resetFields();
            onGenreUpdated?.();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const data = error.response?.data;
                const errorMessage = (data && typeof data === 'object' && 'message' in data)
                    ? (data as { message: string }).message
                    : (typeof data === 'string' ? data : 'Failed to update genre');
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
                            icon={<PlusOutlined/>}
                            size="small"
                            onClick={onAddGenre}
                        >
                            Add Genre
                        </Button>
                    </div>
                }
                name="genres"
                rules={[{required: true, message: 'Please select genres'}]}
            >
                <Select
                    mode="multiple"
                    placeholder="Select genres"
                    style={{width: '100%'}}
                    maxTagCount="responsive"
                    optionLabelProp="label"
                >
                    {genres.map((genre) => (
                        <Select.Option key={genre.id} value={genre.name} label={genre.name}>
                            <GenreOptionItem
                                genre={genre}
                                onEdit={handleEditGenre}
                                onDelete={handleDeleteGenre}
                            />
                        </Select.Option>
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
                            {required: true, message: 'Please enter genre name'},
                            {min: 2, message: 'Genre name must be at least 2 characters'},
                            {max: 50, message: 'Genre name must not exceed 50 characters'},
                            {
                                pattern: /^[A-Za-z\s-]+$/,
                                message: 'Genre name must contain only English letters, dashes, and spaces'
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