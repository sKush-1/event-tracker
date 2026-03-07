import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { Calendar, LogOut, Plus } from 'lucide-react';

export const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-logo">
                    <Calendar size={20} />
                    EventTracker
                </Link>
                {user && (
                    <div className="navbar-actions">
                        <span className="navbar-user">Hi, {user.name.split(' ')[0]}</span>
                        <Link to="/events/new">
                            <button id="nav-create-event" className="btn btn-primary btn-sm">
                                <Plus size={15} />
                                New Event
                            </button>
                        </Link>
                        <button
                            id="nav-logout"
                            className="btn btn-ghost btn-icon"
                            onClick={handleLogout}
                            title="Logout"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};
