import React from 'react';
import AdminLoginForm from '../../components/admin/AdminLoginForm'
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Navigate } from 'react-router-dom';

const AdminLoginPage = () => {
    const { isAuthenticated, loading } = useAdminAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600">Loading...</p>
            </div>
        );
    }
    
    if (isAuthenticated) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return <AdminLoginForm />;
};

export default AdminLoginPage;
