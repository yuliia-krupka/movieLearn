import { useState } from 'react';

interface FileState {
    file: File | null;
    previewUrl: string | null;
    error: string | null;
}

export const useFileUpload = (errorMessage: string) => {
    const [fileState, setFileState] = useState<FileState>({
        file: null,
        previewUrl: null,
        error: null,
    });

    const handleFileChange = (file: File, generatePreview = false): boolean => {
        setFileState(prev => ({ ...prev, file, error: null }));

        if (generatePreview && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFileState(prev => ({
                    ...prev,
                    previewUrl: e.target?.result as string,
                }));
            };
            reader.readAsDataURL(file);
        }

        return false;
    };

    const handleFileRemove = (): void => {
        setFileState({
            file: null,
            previewUrl: null,
            error: errorMessage,
        });
    };

    const validateFile = (): boolean => {
        if (!fileState.file) {
            setFileState(prev => ({ ...prev, error: errorMessage }));
            return false;
        }
        return true;
    };

    return {
        ...fileState,
        handleFileChange,
        handleFileRemove,
        validateFile,
    };
};
