// This service handles API calls for the admin to manage orders

const API_BASE_URL = 'http://localhost:5000/api/admin/orders';

// Reusable helper for authenticated admin API requests
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

// Get all orders for the admin panel
export const getAllOrders = async (token) => {
    try {
        const data = await fetchAdminApi('/', {
            method: 'GET',
            token,
        });
        // Returns { success, count, data: [orders] }
        return data.data;
    } catch (error) {
        console.error('Get all orders failed:', error);
        throw error;
    }
};

// Get a single order's details by ID
export const getOrderById = async (orderId, token) => {
    try {
        const data = await fetchAdminApi(`/${orderId}`, {
            method: 'GET',
            token,
        });
        return data.data;
    } catch (error) {
        console.error(`Get order by ID (${orderId}) failed:`, error);
        throw error;
    }
};

// Update an order's status
export const updateOrderStatus = async (orderId, status, token) => {
    // status: 'Processing', 'Shipped', 'Delivered', 'Cancelled'
    try {
        const data = await fetchAdminApi(`/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
            token,
        });
        return data.data;
    } catch (error) {
        console.error(`Update order status (${orderId}) failed:`, error);
        throw error;
    }
};
