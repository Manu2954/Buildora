import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // 1. If we are performing the initial app-load authentication check, show a loading screen.
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg text-gray-600">Loading Session...</p>
            </div>
        );
    }

    // 2. Once the initial check is done, if the user is not authenticated, redirect them.
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. If the check is done and they are authenticated, render the requested page.
    return children;
};

export default PrivateRoute;
