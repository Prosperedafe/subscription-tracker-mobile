import { authApi } from '@/lib/api';
import { storage } from '@/lib/storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface User {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (name: string, email: string, password: string) => Promise<void>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadAuth = async () => {
            const storedToken = await storage.getItem('token');
            const storedUser = await storage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
            setIsLoading(false);
        };
        loadAuth();
    }, []);

    const signIn = async (email: string, password: string) => {
        const response = await authApi.signIn({ email, password });
        if (response.success && response.data) {
            const { user: userData, token: newToken } = response.data;
            setUser(userData);
            setToken(newToken);
            await storage.setItem('token', newToken);
            await storage.setItem('user', JSON.stringify(userData));
        } else {
            throw new Error(response.message || 'Sign in failed');
        }
    };

    const signUp = async (name: string, email: string, password: string) => {
        const response = await authApi.signUp({ name, email, password });
        if (response.success && response.data) {
            const { user: userData, token: newToken } = response.data;
            setUser(userData);
            setToken(newToken);
            await storage.setItem('token', newToken);
            await storage.setItem('user', JSON.stringify(userData));
        } else {
            throw new Error(response.message || 'Sign up failed');
        }
    };

    const signOut = async () => {
        setUser(null);
        setToken(null);
        await storage.removeItem('token');
        await storage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
