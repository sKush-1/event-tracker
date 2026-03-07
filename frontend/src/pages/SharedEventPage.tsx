import { useState, useEffect } from 'react';

import { useParams, Link } from 'react-router-dom';
import { eventsApi } from '../lib/api';
import { Calendar, MapPin, Clock, User, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface SharedEvent {
    id: string;
    title: string;
    dateTime: string;
    location: string;
    description?: string;
    user: { name: string };
}

export const SharedEventPage = () => {
    const { shareToken } = useParams<{ shareToken: string }>();
    const [event, setEvent] = useState<SharedEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!shareToken) return;
        eventsApi.getShared(shareToken).then(res => {
            setEvent(res.data.event);
        }).catch(() => {
            setError('This event link is invalid or has been removed.');
        }).finally(() => setLoading(false));
    }, [shareToken]);

    if (loading) {
        return (
            <div className="public-event-page">
                <div className="app-bg" />
                <div className="spinner-container"><div className="spinner" /></div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="public-event-page">
                <div className="app-bg" />
                <div className="public-event-card" style={{ textAlign: 'center' }}>
                    <AlertCircle size={48} color="var(--color-danger)" style={{ marginBottom: '16px', opacity: 0.7 }} />
                    <h1 className="auth-title">Event Not Found</h1>
                    <p style={{ color: 'var(--color-text-2)', marginTop: '8px', marginBottom: '24px' }}>
                        {error}
                    </p>
                    <Link to="/login">
                        <button className="btn btn-primary">Go to EventTracker</button>
                    </Link>
                </div>
            </div>
        );
    }

    const eventDate = new Date(event.dateTime);

    return (
        <div className="public-event-page">
            <div className="app-bg" />
            <div className="public-event-card">
                <div className="public-event-tag">
                    <Calendar size={12} />
                    Shared Event
                </div>

                <h1 className="public-event-title">{event.title}</h1>

                <div className="public-event-meta">
                    <div className="public-event-meta-item">
                        <Calendar size={18} className="public-event-meta-icon" />
                        <div>
                            <div style={{ fontWeight: 600 }}>{format(eventDate, 'EEEE, MMMM d, yyyy')}</div>
                            <div style={{ color: 'var(--color-text-2)', fontSize: '0.875rem' }}>Date</div>
                        </div>
                    </div>

                    <div className="public-event-meta-item">
                        <Clock size={18} className="public-event-meta-icon" />
                        <div>
                            <div style={{ fontWeight: 600 }}>{format(eventDate, 'h:mm a')}</div>
                            <div style={{ color: 'var(--color-text-2)', fontSize: '0.875rem' }}>Time</div>
                        </div>
                    </div>

                    <div className="public-event-meta-item">
                        <MapPin size={18} className="public-event-meta-icon" />
                        <div>
                            <div style={{ fontWeight: 600 }}>{event.location}</div>
                            <div style={{ color: 'var(--color-text-2)', fontSize: '0.875rem' }}>Location</div>
                        </div>
                    </div>

                    <div className="public-event-meta-item">
                        <User size={18} className="public-event-meta-icon" />
                        <div>
                            <div style={{ fontWeight: 600 }}>{event.user.name}</div>
                            <div style={{ color: 'var(--color-text-2)', fontSize: '0.875rem' }}>Organizer</div>
                        </div>
                    </div>
                </div>

                {event.description && (
                    <>
                        <div className="divider" />
                        <div className="public-event-desc">{event.description}</div>
                    </>
                )}

                <div className="divider" />

                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--color-text-3)', fontSize: '0.8rem', marginBottom: '12px' }}>
                        Want to track your own events?
                    </p>
                    <Link to="/register">
                        <button className="btn btn-primary">Get started free</button>
                    </Link>
                </div>
            </div>
        </div>
    );
};
