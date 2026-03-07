import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPwd, setShowPwd] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(form.email, form.password);
            navigate('/');
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="app-bg" />
            <div className="auth-card">
                <div className="auth-logo">
                    <div className="auth-logo-title">EventTracker</div>
                    <div className="auth-logo-sub">Your personal event organizer</div>
                </div>

                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Sign in to your account to continue</p>

                {error && (
                    <div className="alert alert-error">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} id="login-form">
                    <div className="form-group">
                        <label htmlFor="login-email">Email address</label>
                        <input
                            id="login-email"
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className="form-group" style={{ position: 'relative' }}>
                        <label htmlFor="login-password">Password</label>
                        <input
                            id="login-password"
                            type={showPwd ? 'text' : 'password'}
                            placeholder="Your password"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            required
                            autoComplete="current-password"
                            style={{ paddingRight: '44px' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPwd(!showPwd)}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                bottom: '12px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--color-text-3)',
                                display: 'flex',
                            }}
                        >
                            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <button
                        id="login-submit"
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={loading}
                    >
                        {loading ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account?{' '}
                    <Link to="/register">Create one</Link>
                </div>
            </div>
        </div>
    );
};
