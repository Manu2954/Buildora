import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

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


export const AuthProvider = ({ children }) => {
    // FIX: Use the safe getter function to prevent crashes on initial load.
    const [token, setToken] = useState(() => safeGetItem('token'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUserProfile = async (currentToken) => {
            if (currentToken) {
                try {
                    const response = await getProfile(currentToken);
                    if (response && response.data) {
                        setUser(response.data);
                    } else {
                        throw new Error("Invalid profile data.");
                    }
                } catch (error) {
                    console.error('Initial auth check failed, clearing token.', error);
                    // FIX: Use safe remove item
                    safeRemoveItem('token');
                    setToken(null);
                }
            }
            setLoading(false);
        };

        loadUserProfile(token);
    }, []); // This dependency is correct, it should only run once.

    const login = async (apiResponse) => {
        if (apiResponse && (apiResponse.token || apiResponse.accessToken)) {
            const newToken = apiResponse.token || apiResponse.accessToken;
            const profileResponse = await getProfile(newToken);
            if (profileResponse && profileResponse.data) {
                // FIX: Use the safe setter function
                safeSetItem('token', newToken);
                setToken(newToken);
                setUser(profileResponse.data);
            } else {
                throw new Error("Login successful, but failed to fetch user profile.");
            }
        } else {
            throw new Error("Login failed: API response did not contain a token.");
        }
    };

    const logout = () => {
        // FIX: Use the safe remove function
        safeRemoveItem('token');
        setToken(null);
        setUser(null);
        window.location.href = '/login';
    };

    const value = {
        user,
        token,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
