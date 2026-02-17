import { defineStore } from 'pinia';
import request from '../api/request';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
        isAdmin: (state) => state.user?.role === 'admin',
    },
    actions: {
        async login(credentials) {
            try {
                const res = await request({
                    url: '/auth/login',
                    method: 'post',
                    data: credentials
                });

                this.token = res.token;
                this.user = res.user;

                localStorage.setItem('token', res.token);
                localStorage.setItem('user', JSON.stringify(res.user));

                // Setup default auth header for future requests is handled in interceptor

                return true;
            } catch (error) {
                console.error('Login failed:', error);
                throw error;
            }
        },
        async register(userData) {
            try {
                const res = await request({
                    url: '/auth/register',
                    method: 'post',
                    data: userData
                });

                this.token = res.token;
                this.user = res.user;

                localStorage.setItem('token', res.token);
                localStorage.setItem('user', JSON.stringify(res.user));

                return true;
            } catch (error) {
                console.error('Registration failed:', error);
                throw error;
            }
        },
        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect handled by component or router
        },
        async fetchUser() {
            if (!this.token) return;
            try {
                const res = await request({
                    url: '/auth/me',
                    method: 'get'
                });
                this.user = res;
                localStorage.setItem('user', JSON.stringify(res));
            } catch (error) {
                this.logout();
            }
        }
    }
});
