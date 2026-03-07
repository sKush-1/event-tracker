import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export const RegisterPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPwd, setShowPwd] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await register(form.name, form.email, form.password);
            navigate('/');
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string; errors?: { message: string }[] } } };
            const msg = e.response?.data?.errors?.[0]?.message || e.response?.data?.message || 'Registration failed';
            setError(msg);
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

                <h1 className="auth-title">Create your account</h1>
                <p className="auth-subtitle">Get started for free — no credit card required</p>

                {error && (
                    <div className="alert alert-error">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} id="register-form">
                    <div className="form-group">
                        <label htmlFor="reg-name">Full name</label>
                        <input
                            id="reg-name"
                            type="text"
                            placeholder="Jane Smith"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            required
                            autoComplete="name"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="reg-email">Email address</label>
                        <input
                            id="reg-email"
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className="form-group" style={{ position: 'relative' }}>
                        <label htmlFor="reg-password">Password</label>
                        <input
                            id="reg-password"
                            type={showPwd ? 'text' : 'password'}
                            placeholder="Min. 6 characters"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            required
                            autoComplete="new-password"
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
                        id="register-submit"
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={loading}
                    >
                        {loading ? 'Creating account…' : 'Create account'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};
