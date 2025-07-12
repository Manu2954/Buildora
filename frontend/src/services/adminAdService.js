// This service handles API calls for the admin to manage advertisements

const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/admin/advertisements`;

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
        throw new Error('Admin authentication required.');
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...restOptions, headers });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'An API error occurred.');
        }
        return data;
    } catch (error) {
        console.error(`API call to ${endpoint} failed:`, error);
        throw error;
    }
}

// Get all advertisements
export const getAds = async (token) => {
    const data = await fetchAdminApi('/', { method: 'GET', token });
    return data.data;
};

// Create a new advertisement
export const createAd = async (adData, token) => {
    // adData: { name, imageUrl, linkTo }
    const data = await fetchAdminApi('/', {
        method: 'POST',
        body: JSON.stringify(adData),
        token,
    });
    return data.data;
};

// Update an advertisement (e.g., to activate/deactivate)
export const updateAd = async (adId, adData, token) => {
    // adData: { isActive: boolean }
    const data = await fetchAdminApi(`/${adId}`, {
        method: 'PUT',
        body: JSON.stringify(adData),
        token,
    });
    return data.data;
};

// Delete an advertisement
export const deleteAd = async (adId, token) => {
    await fetchAdminApi(`/${adId}`, { method: 'DELETE', token });
    return true; // Return true on successful deletion
};
