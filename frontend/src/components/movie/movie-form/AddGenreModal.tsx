import React from 'react';
import { Modal, Form, Input, Button, Space } from 'antd';
import {type NewGenreData } from '../../types/movies.ts';

interface AddGenreModalProps {
    visible: boolean;
    loading: boolean;
    onCancel: () => void;
    onSubmit: (values: NewGenreData) => Promise<void>;
}

const AddGenreModal: React.FC<AddGenreModalProps> = ({
                                                         visible,
                                                         loading,
                                                         onCancel,
                                                         onSubmit,
                                                     }) => {
    const [form] = Form.useForm();

    const handleSubmit = async (values: NewGenreData) => {
        await onSubmit(values);
        form.resetFields();
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title="Add New Genre"
            open={visible}
            onCancel={handleCancel}
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item
                    label="Genre Name"
                    name="name"
                    rules={[
                        { required: true, message: 'Please enter genre name' },
                        { min: 2, message: 'Name must be at least 2 characters' },
                        {
                            pattern: /^[A-Za-z\s]+$/,
                            message: 'Only English letters and spaces are allowed',
                        },
                    ]}
                >
                    <Input placeholder="e.g., Action, Comedy" />
                </Form.Item>

                <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
                    <Space>
                        <Button
                            htmlType="submit"
                            className="add-genre-btn"
                            loading={loading}
                        >
                            Add Genre
                        </Button>
                        <Button onClick={handleCancel}>
                            Cancel
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddGenreModal;