import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

import { authApi } from '../lib/api';

interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token && !user) {
            authApi.me().then(res => {
                setUser(res.data.user);
                localStorage.setItem('user', JSON.stringify(res.data.user));
            }).catch(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
            });
        }
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const res = await authApi.login({ email, password });
            const { token: newToken, user: newUser } = res.data;
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(newUser));
            setToken(newToken);
            setUser(newUser);
        } finally {
            setLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string) => {
        setLoading(true);
        try {
            const res = await authApi.register({ name, email, password });
            const { token: newToken, user: newUser } = res.data;
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(newUser));
            setToken(newToken);
            setUser(newUser);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
