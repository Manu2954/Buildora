const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/admin`;

const safeGetItem = (key) => {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.warn(`Could not access localStorage to get item '${key}':`, error);
        return null;
    }
};

async function fetchAdminApi(endpoint, options = {}) {
    const { token, ...restOptions } = options;
    const headers = {
        'Content-Type': 'application/json',
        ...restOptions.headers,
    };

    const adminToken = token || safeGetItem('adminToken');
    if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
    } else {
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
        error.status = response.status;
        throw error;
    }
    return data;
}

export const getAllLeads = async (token) => {
    try {
        const data = await fetchAdminApi('/leads', { method: 'GET', token });
        return data.data || [];
    } catch (error) {
        console.error('Get all leads failed:', error);
        throw error;
    }
};

export const getLeadById = async (leadId, token) => {
    try {
        const data = await fetchAdminApi(`/leads/${leadId}`, { method: 'GET', token });
        return data.data;
    } catch (error) {
        console.error(`Get lead by ID (${leadId}) failed:`, error);
        throw error;
    }
};

export const updateLead = async (leadId, leadData, token) => {
    try {
        const data = await fetchAdminApi(`/leads/${leadId}`, {
            method: 'PUT',
            body: JSON.stringify(leadData),
            token,
        });
        return data.data;
    } catch (error) {
        console.error(`Update lead (${leadId}) failed:`, error);
        throw error;
    }
};

