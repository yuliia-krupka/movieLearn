import axios from 'axios';
import {message} from 'antd';

const apiClient = axios.create({
    baseURL: '/api',
    withCredentials: true,
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isAxiosError(error) && error.response && error.response.status >= 500) {
            void message.error(`Server error (${error.response.status}). Please try again later.`);
        }
        return Promise.reject(error);
    }
);

export default apiClient;
