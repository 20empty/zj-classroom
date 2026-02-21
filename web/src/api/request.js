import axios from 'axios';

// Create axios instance
const service = axios.create({
    baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:3001/api', // Should be in env
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
service.interceptors.request.use(
    config => {
        // Add auth token if exists
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Response interceptor
service.interceptors.response.use(
    response => {
        // Unpack data if standard response format { success, data, message }
        const res = response.data;
        if (res && typeof res.success === 'boolean') {
            if (res.success) {
                return res.data;
            } else {
                // Handle logical error
                console.error('API Error:', res.message);
                return Promise.reject(new Error(res.message || 'Error'));
            }
        }
        return res;
    },
    error => {
        console.error('Request Error:', error);

        // Enhance global error handling UI interpretation
        let message = '网络或服务器发生错误，请稍后再试';
        if (error.response) {
            if (error.response.status === 401) {
                message = '会话已过期或未授权，请重新登录';
                // Remove token to force clean state
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } else {
                message = error.response.data?.message || error.response.data?.error || `请求出错 (${error.response.status})`;
            }
        } else if (error.message) {
            message = error.message;
        }

        return Promise.reject(new Error(message));
    }
);

export default service;
