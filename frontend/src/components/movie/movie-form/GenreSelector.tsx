import React from 'react';
import { Form, Select, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {type Genre } from './types.tsx';

const { Option } = Select;

interface GenreSelectorProps {
    genres: Genre[];
    onAddGenre: () => void;
}

const GenreSelector: React.FC<GenreSelectorProps> = ({ genres, onAddGenre }) => {
    return (
        <Form.Item
            label={
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
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
            <Select mode="multiple" placeholder="Select genres">
                {genres.map((genre) => (
                    <Option key={genre.id} value={genre.name}>
                        {genre.name}
                    </Option>
                ))}
            </Select>
        </Form.Item>
    );
};

export default GenreSelector;