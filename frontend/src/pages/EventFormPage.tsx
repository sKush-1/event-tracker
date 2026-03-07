import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventsApi } from '../lib/api';
import { AlertCircle, ArrowLeft, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface FormData {
    title: string;
    dateTime: string;
    location: string;
    description: string;
}

export const EventFormPage = () => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState<FormData>({
        title: '',
        dateTime: '',
        location: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fetching, setFetching] = useState(isEdit);

    useEffect(() => {
        if (!isEdit || !id) return;
        eventsApi.getOne(id).then(res => {
            const ev = res.data.event;
            const dt = new Date(ev.dateTime);
            const localDT = format(dt, "yyyy-MM-dd'T'HH:mm");
            setForm({
                title: ev.title,
                dateTime: localDT,
                location: ev.location,
                description: ev.description || '',
            });
        }).catch(() => {
            setError('Event not found');
        }).finally(() => setFetching(false));
    }, [id, isEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!form.title.trim() || !form.dateTime || !form.location.trim()) {
            setError('Title, date/time, and location are required');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title: form.title.trim(),
                dateTime: new Date(form.dateTime).toISOString(),
                location: form.location.trim(),
                description: form.description.trim() || undefined,
            };

            if (isEdit && id) {
                await eventsApi.update(id, payload);
            } else {
                await eventsApi.create(payload);
            }
            navigate('/');
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string; errors?: { message: string }[] } } };
            const msg = e.response?.data?.errors?.[0]?.message || e.response?.data?.message || 'Failed to save event';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="layout">
                <div className="app-bg" />
                <div className="main-content">
                    <div className="spinner-container"><div className="spinner" /></div>
                </div>
            </div>
        );
    }

    const now = format(new Date(), "yyyy-MM-dd'T'HH:mm");

    return (
        <div className="layout">
            <div className="app-bg" />
            <div className="main-content">
                <div className="page-header">
                    <div>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '8px' }}>
                            <ArrowLeft size={15} /> Back
                        </button>
                        <h1 className="page-title">
                            <Calendar size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
                            {isEdit ? 'Edit Event' : 'Create Event'}
                        </h1>
                        <p className="page-subtitle">
                            {isEdit ? 'Update your event details' : 'Fill in the details for your new event'}
                        </p>
                    </div>
                </div>

                <div className="card" style={{ maxWidth: '600px' }}>
                    {error && (
                        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} id="event-form">
                        <div className="form-group">
                            <label htmlFor="event-title">Event Title *</label>
                            <input
                                id="event-title"
                                type="text"
                                placeholder="e.g. Team Standup, Birthday Party"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                required
                                maxLength={200}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="event-datetime">Date & Time *</label>
                            <input
                                id="event-datetime"
                                type="datetime-local"
                                value={form.dateTime}
                                min={isEdit ? undefined : now}
                                onChange={e => setForm({ ...form, dateTime: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="event-location">Location *</label>
                            <input
                                id="event-location"
                                type="text"
                                placeholder="e.g. Conference Room A, Zoom, Central Park"
                                value={form.location}
                                onChange={e => setForm({ ...form, location: e.target.value })}
                                required
                                maxLength={500}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="event-description">Description <span style={{ color: 'var(--color-text-3)' }}>(optional)</span></label>
                            <textarea
                                id="event-description"
                                placeholder="Add more context or agenda for this event…"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                maxLength={2000}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate(-1)}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                id="event-submit"
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading
                                    ? (isEdit ? 'Saving…' : 'Creating…')
                                    : (isEdit ? 'Save Changes' : 'Create Event')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
