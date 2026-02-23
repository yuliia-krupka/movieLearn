import React from 'react';
import {Form, Upload, Button} from 'antd';
import {DeleteOutlined, FileOutlined, PictureOutlined} from '@ant-design/icons';

interface FileUploaderProps {
    label: string;
    file: File | null;
    previewUrl?: string | null;
    error?: string | null;
    accept?: string;
    onFileChange: (file: File) => boolean;
    onFileRemove: () => void;
    uploadButtonText: string;
    showPreview?: boolean;
    description?: string;
    iconType?: 'image' | 'document';
}

const FileUploader: React.FC<FileUploaderProps> = ({
                                                       label,
                                                       file,
                                                       error,
                                                       accept,
                                                       onFileChange,
                                                       onFileRemove,
                                                       uploadButtonText,
                                                       description,
                                                       iconType = 'document',
                                                   }) => {
    return (
        <Form.Item label={label} required>
            <div className="upload-section">
                {!file ? (
                    <Upload
                        beforeUpload={onFileChange}
                        showUploadList={false}
                        maxCount={1}
                        accept={accept}
                    >
                        <div className="custom-upload-dropzone">
                            <div className={`upload-icon-wrapper ${iconType}`}>
                                {iconType === 'image' ? <PictureOutlined className="upload-icon-inner"/> :
                                    <FileOutlined className="upload-icon-inner"/>}
                            </div>
                            <div className="upload-text-wrapper">
                                <span className="upload-title">{uploadButtonText}</span>
                                {description && <span className="upload-description">{description}</span>}
                            </div>
                        </div>
                    </Upload>
                ) : (
                    <div className="selected-file-container">
                        <div className={`selected-file-icon-wrapper ${iconType}`}>
                            {iconType === 'image' ? <PictureOutlined className="selected-icon-inner"/> :
                                <FileOutlined className="selected-icon-inner"/>}
                        </div>
                        <div className="selected-file-info">
                            <p className="selected-file-name">{file.name}</p>
                            <p className="selected-file-size">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <Button
                            type="text"
                            className="remove-file-icon-btn"
                            icon={<DeleteOutlined className="remove-icon-inner"/>}
                            onClick={onFileRemove}
                        />
                    </div>
                )}
            </div>
            {error && <div style={{color: 'red', marginTop: 4}}>{error}</div>}
        </Form.Item>
    );
};

export default FileUploader;