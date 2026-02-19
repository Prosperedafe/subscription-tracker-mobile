import axios from "axios";
import { Platform } from "react-native";
import { storage } from "./storage";

const API_PORT = 5500;
const API_TIMEOUT_MS = 20000;

function getDefaultApiBaseUrl(): string {
  if (Platform.OS === "web") {
    return `http://localhost:${API_PORT}`;
  }
  if (Platform.OS === "android") {
    return `http://192.168.0.133:${API_PORT}`;
  }
  return `http://localhost:${API_PORT}`;
}

const envUrl =
  typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL?.trim();
const API_BASE_URL = envUrl || getDefaultApiBaseUrl();

export const getApiBaseUrl = () => `${API_BASE_URL}/api`;

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.removeItem("token");
      await storage.removeItem("user");
    }
    return Promise.reject(error);
  },
);

const isDev = __DEV__;

export const authApi = {
  signUp: async (data: { name: string; email: string; password: string }) => {
    const response = await apiClient.post("/auth/sign-up", data);
    return response.data;
  },
  signIn: async (data: { email: string; password: string }) => {
    try {
      const response = await apiClient.post("/auth/sign-in", data);
      return response.data;
    } catch (err: any) {
      throw err;
    }
  },
};

export const subscriptionsApi = {
  create: async (data: {
    name: string;
    price: number;
    currency: "USD" | "EUR" | "GBP";
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    category: "food" | "entertainment" | "health" | "education" | "other";
    paymentMethod: string;
    status?: "active" | "inactive" | "expired";
    startDate: string;
    renewalDate: string;
  }) => {
    const response = await apiClient.post("/subscriptions", data);
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
