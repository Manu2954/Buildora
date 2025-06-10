import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(true); // This state is now ONLY for the initial app load check.

    useEffect(() => {
        // This effect runs only once when the app first loads.
        const loadUserProfile = async (currentToken) => {
          console.log("current", currentToken)
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
                    localStorage.removeItem('token');
                    setToken(null);
                }
            }
            // We are done with the initial load check.
            setLoading(false);
        };
console.log("loc", token)
        loadUserProfile(token);
    }, []); // Empty dependency array ensures this runs only once on mount.

    // The login function is now fully responsible for the entire login flow.
    const login = async (apiResponse) => {
        if (apiResponse && (apiResponse.token || apiResponse.accessToken)) {
            const newToken = apiResponse.token || apiResponse.accessToken;
            console.log("new", newToken)
            // Set the user and token state directly and synchronously after login.
            // This prevents the app from navigating before the user state is updated.
            const profileResponse = await getProfile(newToken);
            if (profileResponse && profileResponse.data) {
                localStorage.setItem('token', newToken);
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
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        window.location.href = '/login'; // Redirect after state is fully cleared
    };

    const value = {
        user,
        token,
        // isAuthenticated is now true only if there is a user.
        isAuthenticated: !!user,
        login,
        logout,
        loading, // Expose the initial loading state.
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
