import {AxiosError} from 'axios';

import type {ErrorResponse} from '../../types/common';

export class ErrorHandler {
    static isDuplicateError(error: AxiosError<ErrorResponse>): boolean {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message || '';
        return status === 409 || message.toLowerCase().includes('already exists');
    }

    static getErrorMessage(error: AxiosError<ErrorResponse>, duplicateMessage: string): string {
        if (this.isDuplicateError(error)) {
            return duplicateMessage;
        }
        const data = error.response?.data;
        if (data && typeof data === 'object' && 'message' in data) {
            return (data as { message: string }).message || 'An unexpected error occurred.';
        }
        if (typeof data === 'string') {
            return data;
        }
        return error.message || 'An unexpected error occurred. Please try again.';
    }

    static handleAxiosError(error: unknown, duplicateMessage: string): string {
        const axiosError = error as AxiosError<ErrorResponse>;

        if (axiosError.response) {
            return this.getErrorMessage(axiosError, duplicateMessage);
        } else if (axiosError.request) {
            return 'Error connecting to server. Please check your internet connection.';
        } else {
            return `Error: ${axiosError.message}`;
        }
    }
}