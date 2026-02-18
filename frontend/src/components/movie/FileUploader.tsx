import React from 'react';
import {Form, Upload, Button, Image} from 'antd';
import {UploadOutlined, DeleteOutlined} from '@ant-design/icons';

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
}

const FileUploader: React.FC<FileUploaderProps> = ({
                                                       label,
                                                       file,
                                                       previewUrl,
                                                       error,
                                                       accept,
                                                       onFileChange,
                                                       onFileRemove,
                                                       uploadButtonText,
                                                       showPreview = false,
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
                        <Button icon={<UploadOutlined/>}>
                            {uploadButtonText}
                        </Button>
                    </Upload>
                ) : (
                    <div className={showPreview ? "image-preview-container" : "file-info-container"}>
                        {showPreview && previewUrl && (
                            <div className="image-preview">
                                <Image
                                    src={previewUrl}
                                    alt="Preview"
                                    className="preview-image"
                                    fallback="/api/placeholder/120/160"
                                />
                            </div>
                        )}
                        <div className={showPreview ? "image-info" : "file-info"}>
                            <p className="file-name">{file.name}</p>
                            <p className="file-size">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <Button
                                danger
                                size="small"
                                icon={<DeleteOutlined/>}
                                onClick={onFileRemove}
                            >
                                Remove
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            {error && <div style={{color: 'red', marginTop: 4}}>{error}</div>}
        </Form.Item>
    );
};

export default FileUploader;