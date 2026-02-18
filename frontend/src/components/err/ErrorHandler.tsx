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
        return error.response?.data?.message || 'An unexpected error occurred. Please try again.';
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