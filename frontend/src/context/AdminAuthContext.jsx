import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminGetProfile } from '../services/adminAuthService'; // We'll create this service next

const AdminAuthContext = createContext(null);

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('adminToken'));
    const [loading, setLoading] = useState(true); // Initially true to load admin profile

    useEffect(() => {
        // Function to fetch admin profile if token exists
        const loadAdminProfile = async (currentToken) => {
            if (currentToken) {
                try {
                    const profile = await adminGetProfile(currentToken);
                    setAdmin(profile);
                } catch (error) {
                    console.error('Failed to load admin profile:', error);
                    localStorage.removeItem('adminToken');
                    setToken(null);
                    setAdmin(null);
                }
            }
            setLoading(false);
        };

        loadAdminProfile(token);
    }, [token]);

    const login = (adminData, newToken) => {
        localStorage.setItem('adminToken', newToken);
        setToken(newToken);
        setAdmin(adminData);
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        setToken(null);
        setAdmin(null);
    };

    const value = {
        admin,
        token,
        isAuthenticated: !!token && !!admin,
        login,
        logout,
        loading, // expose loading state
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export default AdminAuthContext;
