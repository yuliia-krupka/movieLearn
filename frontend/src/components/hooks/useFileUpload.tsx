import {useState, useCallback, useMemo} from 'react';

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

    const handleFileChange = useCallback((file: File, generatePreview = false): boolean => {
        setFileState(prev => ({...prev, file, error: null}));

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
    }, []);

    const handleFileRemove = useCallback((): void => {
        setFileState({
            file: null,
            previewUrl: null,
            error: errorMessage,
        });
    }, [errorMessage]);

    const setPreviewUrl = useCallback((url: string | null) => {
        setFileState(prev => ({...prev, previewUrl: url}));
    }, []);

    const validateFile = useCallback((): boolean => {
        if (!fileState.file) {
            setFileState(prev => ({...prev, error: errorMessage}));
            return false;
        }
        return true;
    }, [fileState.file, errorMessage]);

    return useMemo(() => ({
        ...fileState,
        handleFileChange,
        handleFileRemove,
        setPreviewUrl,
        validateFile,
    }), [fileState, handleFileChange, handleFileRemove, setPreviewUrl, validateFile]);
};
