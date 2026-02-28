import {message} from 'antd';

const API_BASE = '/api';

async function request(url: string, options: RequestInit = {}): Promise<Response> {
    let response: Response;
    try {
        response = await fetch(`${API_BASE}${url}`, {
            ...options,
            credentials: 'include',
            headers: {...options.headers},
        });
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Network error';
        void message.error(`Connection error: ${msg}`);
        throw error;
    }

    if (!response.ok && response.status >= 500) {
        void message.error(`Server error (${response.status}). Please try again later.`);
    }

    return response;
}

export const api = {
    get: (url: string) => request(url),
    post: (url: string, body?: unknown) => request(url, {
        method: 'POST',
        ...(body ? {headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)} : {}),
    }),
    put: (url: string, body: unknown) => request(url, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
    }),
    delete: (url: string) => request(url, {method: 'DELETE'}),
};
