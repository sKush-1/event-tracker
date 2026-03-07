import { useState, useEffect, useCallback } from 'react';

import { Link } from 'react-router-dom';
import { eventsApi } from '../lib/api';
import { format, isPast } from 'date-fns';
import { Calendar, MapPin, Clock, Plus, Share2, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Event {
    id: string;
    title: string;
    dateTime: string;
    location: string;
    description?: string;
    shareToken: string;
    createdAt: string;
}

type Filter = 'all' | 'upcoming' | 'past';

export const EventsListPage = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [filter, setFilter] = useState<Filter>('all');
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const res = await eventsApi.getAll(filter === 'all' ? undefined : filter);
            setEvents(res.data.events);
        } catch {
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
        setDeletingId(id);
        try {
            await eventsApi.delete(id);
            setEvents(prev => prev.filter(e => e.id !== id));
            toast.success('Event deleted');
        } catch {
            toast.error('Failed to delete event');
        } finally {
            setDeletingId(null);
        }
    };

    const handleCopyShare = async (shareToken: string, id: string) => {
        const url = `${window.location.origin}/share/${shareToken}`;
        await navigator.clipboard.writeText(url);
        setCopiedId(id);
        toast.success('Share link copied!');
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="layout">
            <div className="app-bg" />
            <div className="main-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">My Events</h1>
                        <p className="page-subtitle">
                            {events.length} event{events.length !== 1 ? 's' : ''} {filter !== 'all' ? `— ${filter}` : ''}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div className="filter-tabs">
                            {(['all', 'upcoming', 'past'] as Filter[]).map(f => (
                                <button
                                    key={f}
                                    id={`filter-${f}`}
                                    className={`filter-tab${filter === f ? ' active' : ''}`}
                                    onClick={() => setFilter(f)}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                        <Link to="/events/new">
                            <button id="create-event-btn" className="btn btn-primary">
                                <Plus size={16} /> New Event
                            </button>
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="spinner-container">
                        <div className="spinner" />
                    </div>
                ) : events.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <Calendar size={64} color="var(--color-text-3)" />
                        </div>
                        <h3>
                            {filter === 'upcoming' ? 'No upcoming events' :
                                filter === 'past' ? 'No past events' :
                                    'No events yet'}
                        </h3>
                        <p>
                            {filter === 'all' ? 'Create your first event to get started.' : `Try switching to "All" to see other events.`}
                        </p>
                        {filter === 'all' && (
                            <Link to="/events/new">
                                <button className="btn btn-primary">
                                    <Plus size={16} /> Create Event
                                </button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="events-list">
                        {events.map(event => {
                            const isEventPast = isPast(new Date(event.dateTime));
                            return (
                                <div
                                    key={event.id}
                                    className={`event-card${isEventPast ? ' past' : ''}`}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                        <p className="event-title">{event.title}</p>
                                        <span className={`event-badge ${isEventPast ? 'badge-past' : 'badge-upcoming'}`}>
                                            {isEventPast ? 'Past' : '● Upcoming'}
                                        </span>
                                    </div>

                                    <div className="event-meta">
                                        <span className="event-meta-item">
                                            <Calendar size={14} />
                                            {format(new Date(event.dateTime), 'EEE, MMM d, yyyy')}
                                        </span>
                                        <span className="event-meta-item">
                                            <Clock size={14} />
                                            {format(new Date(event.dateTime), 'h:mm a')}
                                        </span>
                                        <span className="event-meta-item">
                                            <MapPin size={14} />
                                            {event.location}
                                        </span>
                                    </div>

                                    {event.description && (
                                        <p className="event-desc">{event.description}</p>
                                    )}

                                    <div className="event-actions">
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => handleCopyShare(event.shareToken, event.id)}
                                            title="Copy share link"
                                        >
                                            <Share2 size={14} />
                                            {copiedId === event.id ? 'Copied!' : 'Share'}
                                        </button>
                                        <Link to={`/events/${event.id}/edit`}>
                                            <button className="btn btn-secondary btn-sm">
                                                <Edit2 size={14} /> Edit
                                            </button>
                                        </Link>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(event.id, event.title)}
                                            disabled={deletingId === event.id}
                                        >
                                            <Trash2 size={14} />
                                            {deletingId === event.id ? 'Deleting…' : 'Delete'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
