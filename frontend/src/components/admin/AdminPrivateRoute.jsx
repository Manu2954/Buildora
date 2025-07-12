import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminPrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAdminAuth();
    const location = useLocation();

    if (loading) {
        // You might want a more sophisticated loading spinner here
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600">Loading authentication state...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect them to the /admin/login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience
        // than dropping them off on the home page.
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return children ? children : <Outlet />; // Outlet allows nested routes to render
};

export default AdminPrivateRoute;
