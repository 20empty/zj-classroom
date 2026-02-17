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
        // Handle 401, 403, 500
        return Promise.reject(error);
    }
);

export default service;
