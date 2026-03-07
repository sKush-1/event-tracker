import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 globally (token expired)
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

// ── Auth ────────────────────────────────────────────────────────────
export const authApi = {
    register: (data: { name: string; email: string; password: string }) =>
        api.post('/auth/register', data),
    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),
    me: () => api.get('/auth/me'),
};

// ── Events ──────────────────────────────────────────────────────────
export const eventsApi = {
    getAll: (filter?: 'upcoming' | 'past' | 'all') =>
        api.get('/events', { params: filter && filter !== 'all' ? { filter } : undefined }),
    getOne: (id: string) => api.get(`/events/${id}`),
    create: (data: { title: string; dateTime: string; location: string; description?: string }) =>
        api.post('/events', data),
    update: (id: string, data: Partial<{ title: string; dateTime: string; location: string; description: string }>) =>
        api.patch(`/events/${id}`, data),
    delete: (id: string) => api.delete(`/events/${id}`),
    getShared: (shareToken: string) => api.get(`/events/share/${shareToken}`),
};

export default api;
