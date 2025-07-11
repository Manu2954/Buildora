// This service handles API calls for customer authentication (login, register, etc.)
const API_BASE_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/auth` : '/api/auth';

// A robust helper for making API calls
async function fetchApi(endpoint, options = {}) {
    const { token, ...restOptions } = options;
    const headers = {
        'Content-Type': 'application/json',
        ...restOptions.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...restOptions,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            // Use the error message from the backend response if available
            const errorMessage = data.message || `HTTP error! Status: ${response.status}`;
            const error = new Error(errorMessage);
            error.data = data; // Attach full error object for more details
            throw error;
        }
        
        return data;

    } catch (error) {
        console.error(`API call to ${endpoint} failed:`, error.message);
        throw error; // Re-throw the error to be handled by the calling component
    }
}

// Register a new customer
export const registerUser = async (userData) => {
    // userData: { name, email, password }
    return fetchApi('/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
};

// Login a customer
export const loginUser = async (credentials) => {
    // credentials: { email, password }
    return fetchApi('/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
};

// Get the profile of the currently logged-in user
export const getProfile = async (token) => {
    return fetchApi('/me', {
        method: 'GET',
        token: token,
    });
};

// Verify the user's email with a token from the URL
export const verifyUserEmail = async (verificationToken) => {
    return fetchApi(`/verify/${verificationToken}`, {
        method: 'GET',
    });
};



// Update user details (name, email, address)
export const updateUserDetails = async (userData, token) => {
    return fetchApi('/updatedetails', {
        method: 'PUT',
        body: JSON.stringify(userData),
        token,
    });
};

// Update user password
export const updateUserPassword = async (passwordData, token) => {
    // passwordData: { currentPassword, newPassword }
    return fetchApi('/updatepassword', {
        method: 'PUT',
        body: JSON.stringify(passwordData),
        token,
    });
};