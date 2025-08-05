import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminGetProfile } from '../services/adminAuthService';

const AdminAuthContext = createContext(null);

export const useAdminAuth = () => useContext(AdminAuthContext);

// Helper function to safely get an item from localStorage
const safeGetItem = (key) => {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.warn(`Could not access localStorage to get item '${key}':`, error);
        return null;
    }
};

// Helper function to safely set an item in localStorage
const safeSetItem = (key, value) => {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.warn(`Could not access localStorage to set item '${key}':`, error);
    }
};

// Helper function to safely remove an item from localStorage
const safeRemoveItem = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.warn(`Could not access localStorage to remove item '${key}':`, error);
    }
};

export const AdminAuthProvider = ({ children }) => {
    // FIX: Use the safe getter function to prevent crashes.
    const [token, setToken] = useState(() => safeGetItem('adminToken'));
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAdminProfile = async (currentToken) => {
            if (currentToken) {
                try {
                    const profile = await adminGetProfile(currentToken);
                    setAdmin(profile);
                } catch (error) {
                    console.error('Failed to load admin profile:', error);
                    // FIX: Use safe remove item
                    safeRemoveItem('adminToken');
                    setToken(null);
                    setAdmin(null);
                }
            }
            setLoading(false);
        };

        loadAdminProfile(token);
        // FIX: Dependency array should be empty to run only once on mount.
        // The login/logout functions handle subsequent token changes.
    }, []);

    const login = (adminData, newToken) => {
        // FIX: Use the safe setter function
        safeSetItem('adminToken', newToken);
        setToken(newToken);
        setAdmin(adminData);
    };

    const logout = () => {
        // FIX: Use the safe remove function
        safeRemoveItem('adminToken');
        setToken(null);
        setAdmin(null);
    };

    const value = {
        admin,
        token,
        isAuthenticated: !!token && !!admin,
        login,
        logout,
        loading,
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export default AdminAuthContext;
