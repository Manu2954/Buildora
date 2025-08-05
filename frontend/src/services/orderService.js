// This service handles API calls for customer orders

const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/orders`;

const safeGetItem = (key) => {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.warn(`Could not access localStorage to get item '${key}':`, error);
        return null;
    }
};
// Reusable helper for authenticated API requests
async function fetchProtectedApi(endpoint, options = {}) {
    const { token, ...restOptions } = options;
    const headers = {
        'Content-Type': 'application/json',
        ...restOptions.headers,
    };

    // Get the customer token from localStorage. It must exist for these calls.
    // const userToken = token || localStorage.getItem('token');
    const userToken = token || safeGetItem('token');

    // if (adminToken) {
    //     headers['Authorization'] = `Bearer ${adminToken}`;
    // } else {
    //     // This part is fine, it correctly handles the case where no token is found
    //     throw new Error('Admin authentication required.');
    // }

    if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
    } else {
        // This should ideally not happen if routes are protected, but it's a good safeguard.
        console.error('User token not found for API call to', endpoint);
        throw new Error('You must be logged in to perform this action.');
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

// Create a new order
export const createOrder = async (orderData, token) => {
    // orderData: { orderItems, shippingAddress, paymentMethod, itemsPrice, totalPrice, ... }
    try {
        const data = await fetchProtectedApi('/', {
            method: 'POST',
            body: JSON.stringify(orderData),
            token,
        });
        // Returns { success: true, data: createdOrder }
        return data.data;
    } catch (error) {
        console.error('Create order failed:', error);
        throw error;
    }
};

// Get the current user's order history
export const getMyOrders = async (token) => {
    try {
        const data = await fetchProtectedApi('/myorders', {
            method: 'GET',
            token,
        });
        // Returns { success: true, count, data: [orders] }
        console.log(data);
        return data.data;
    } catch (error) {
        console.error('Fetching my orders failed:', error);
        throw error;
    }
};

// Get details for a single order by its ID
export const getOrderDetails = async (orderId, token) => {
    try {
        const data = await fetchProtectedApi(`/${orderId}`, {
            method: 'GET',
            token,
        });
        // Returns { success: true, data: order }
        return data.data;
    } catch (error) {
        console.error(`Fetching order details for ${orderId} failed:`, error);
        throw error;
    }
};
