import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = () => {
    const { user, token } = useAuth();
    if (!user && !token) {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
};
