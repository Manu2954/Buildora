// This service will interact with the /api/admin/dashboard endpoints

const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/admin/dashboard`;

// Reusable helper function for API requests
async function fetchAdminApi(endpoint, options = {}) {
    const { token, ...restOptions } = options;
    const headers = {
        'Content-Type': 'application/json',
        ...restOptions.headers,
    };

    const adminToken = token || localStorage.getItem('adminToken');

    if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
    } else {
        console.error('Admin token not found for API call to', endpoint);
        throw new Error('Admin authentication required.');
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
        throw error;
    }
    return data;
}

// Get advanced dashboard analytics with date filtering
export const getAnalytics = async (filters = {}, token) => {
    // Convert the filters object into a URL query string
    const query = new URLSearchParams(filters).toString();
    try {
        // The backend returns an object: { success, data: { ...stats } }
        const response = await fetchAdminApi(`/analytics?${query}`, {
            method: 'GET',
            token,
        });
        return response.data; // Return the nested data object with all stats
    } catch (error) {
        console.error('Get dashboard analytics failed:', error);
        throw error;
    }
};
