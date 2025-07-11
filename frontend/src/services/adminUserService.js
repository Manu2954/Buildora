// This service will interact with the /api/admin/users endpoints

const API_BASE_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/admin` : '/api/admin';

// Reusable helper function for API requests
async function fetchAdminApi(endpoint, options = {}) {
    const { token, ...restOptions } = options;
    const headers = {
        'Content-Type': 'application/json',
        ...restOptions.headers,
    };

    // Get token from localStorage as a fallback
    const adminToken = token || localStorage.getItem('adminToken');

    if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
    } else {
        console.error('Admin token not found for API call to', endpoint);
        throw new Error('Authentication required.');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...restOptions,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        const errorMessage = data.message || `HTTP error! status: ${response.status}`;
        const error = new Error(errorMessage);
        error.data = data;
        error.status = response.status;
        throw error;
    }
    return data;
}

// Get all users with filtering and pagination
export const getAllUsers = async (params = {}, token) => {
    // params: { page, limit, role, search }
    const query = new URLSearchParams(params).toString();
    try {
        // The backend returns an object: { success, count, totalPages, currentPage, data }
        const data = await fetchAdminApi(`/users?${query}`, {
            method: 'GET',
            token,
        });
        console.log(data.users);
        return data;
    } catch (error) {
        console.error('Get all users failed:', error);
        throw error;
    }
};

// Get a single user by their ID
export const getUserById = async (userId, token) => {
    try {
        const data = await fetchAdminApi(`/users/${userId}`, {
            method: 'GET',
            token,
        });
        return data.data; // The user object is nested in 'data'
    } catch (error) {
        console.error(`Get user by ID (${userId}) failed:`, error);
        throw error;
    }
};

// Update a user's details (e.g., role, isActive status)
export const updateUser = async (userId, userData, token) => {
    // userData: { role?, isActive? }
    try {
        const data = await fetchAdminApi(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
            token,
        });
        return data.data; // The updated user object
    } catch (error) {
        console.error(`Update user (${userId}) failed:`, error);
        throw error;
    }
};

// Delete a user
export const deleteUser = async (userId, token) => {
    try {
        const data = await fetchAdminApi(`/users/${userId}`, {
            method: 'DELETE',
            token,
        });
        return data; // Returns { success: true, message: "..." }
    } catch (error) {
        console.error(`Delete user (${userId}) failed:`, error);
        throw error;
    }
};