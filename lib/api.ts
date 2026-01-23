import axios from 'axios';
import { Platform } from 'react-native';
import { storage } from './storage';

const API_BASE_URL = __DEV__
    ? (Platform.OS === 'web' ? 'http://localhost:5500' : 'http://localhost:5500')
    : 'http://localhost:5500';

export const apiClient = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    async (config) => {
        const token = await storage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await storage.removeItem('token');
            await storage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    signUp: async (data: { name: string; email: string; password: string }) => {
        const response = await apiClient.post('/auth/sign-up', data);
        return response.data;
    },
    signIn: async (data: { email: string; password: string }) => {
        const response = await apiClient.post('/auth/sign-in', data);
        return response.data;
    },
};

export const subscriptionsApi = {
    create: async (data: {
        name: string;
        price: number;
        currency: 'USD' | 'EUR' | 'GBP';
        frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
        category: 'food' | 'entertainment' | 'health' | 'education' | 'other';
        paymentMethod: string;
        status?: 'active' | 'inactive' | 'expired';
        startDate: string;
        renewalDate: string;
    }) => {
        const response = await apiClient.post('/subscriptions', data);
        return response.data;
    },
    getUserSubscriptions: async (userId: string) => {
        const response = await apiClient.get(`/subscriptions/user/${userId}`);
        return response.data;
    },
};

export const usersApi = {
    getById: async (id: string) => {
        const response = await apiClient.get(`/users/${id}`);
        return response.data;
    },
};
