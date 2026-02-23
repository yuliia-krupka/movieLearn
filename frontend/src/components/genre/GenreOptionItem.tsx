import React from 'react';
import {Button, Popconfirm} from 'antd';
import {DeleteOutlined, EditOutlined} from '@ant-design/icons';
import {type Genre} from '../../types/genre';

interface GenreOptionItemProps {
    genre: Genre;
    onEdit: (genre: Genre) => void;
    onDelete: (genreId: number, genreName: string) => void;
}

const GenreOptionItem: React.FC<GenreOptionItemProps> = ({genre, onEdit, onDelete}) => {
    return (
        <div className="genre-option-container">
            <span>{genre.name}</span>
            <div className="genre-actions">
                <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined/>}
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(genre);
                    }}
                    className="genre-edit-btn"
                />
                <Popconfirm
                    title="Delete Genre"
                    description={`Are you sure you want to delete "${genre.name}" ?`}
                    onConfirm={(e) => {
                        e?.stopPropagation();
                        onDelete(genre.id, genre.name);
                    }}
                    onCancel={(e) => {
                        e?.stopPropagation();
                    }}
                    okText="Yes"
                    cancelText="No"
                    placement="left"
                >
                    <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined/>}
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        className="genre-delete-btn"
                    />
                </Popconfirm>
            </div>
        </div>
    );
};

export default GenreOptionItem;
