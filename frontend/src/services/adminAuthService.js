const API_BASE_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/admin` : '/api/admin';

// Helper function for API requests
async function fetchApi(endpoint, options = {}) {
    const { token, ...restOptions } = options;
    const headers = {
        'Content-Type': 'application/json',
        ...restOptions.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...restOptions,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        const errorMessage = data.message || `HTTP error! status: ${response.status}`;
        console.error(`API Error (${endpoint}):`, errorMessage, data.errors || '');
        const error = new Error(errorMessage);
        error.data = data; // Attach full error data
        throw error;
    }
    return data;
}

export const adminLogin = async (credentials) => {
    // credentials: { email, password }
    try {
        const data = await fetchApi('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        // The API returns admin info and token directly in the response body
        return data; // { _id, name, email, role, token, message }
    } catch (error) {
        console.error('Admin login failed:', error);
        throw error; // Re-throw to be handled by the component
    }
};

export const adminRegister = async (adminData) => {
    // adminData: { name, email, password, role? }
    // Note: Use this with caution, registration might be restricted
    try {
        const data = await fetchApi('/auth/register', {
            method: 'POST',
            body: JSON.stringify(adminData),
        });
        return data; // { _id, name, email, role, token, message }
    } catch (error) {
        console.error('Admin registration failed:', error);
        throw error;
    }
};

export const adminGetProfile = async (token) => {
    try {
        const data = await fetchApi('/auth/me', {
            method: 'GET',
            token: token, // Pass token for authorization header
        });
        return data; // { _id, name, email, role, createdAt }
    } catch (error) {
        console.error('Get admin profile failed:', error);
        throw error;
    }
};