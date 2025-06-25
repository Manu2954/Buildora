// This service handles API calls for Razorpay payment processing.

const API_BASE_URL = '/api/payment';

async function fetchProtectedApi(endpoint, options = {}) {
    const { token, ...restOptions } = options;
    const headers = { 'Content-Type': 'application/json', ...restOptions.headers };
    const userToken = token || localStorage.getItem('token');

    if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
    } else {
        throw new Error('You must be logged in to perform this action.');
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

// 1. Create a Razorpay order to get a Razorpay order_id
export const createRazorpayOrder = async (amount, token) => {
    try {
        const data = await fetchProtectedApi('/create-order', {
            method: 'POST',
            body: JSON.stringify({ amount }),
            token,
        });
        // Returns { success: true, order: { id, amount, currency, ... } }
        return data.order;
    } catch (error) {
        throw error;
    }
};

// 2. Verify the payment signature after the user pays
export const verifyPayment = async (paymentData, token) => {
    // paymentData: { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id_from_db }
    try {
        const data = await fetchProtectedApi('/verify', {
            method: 'POST',
            body: JSON.stringify(paymentData),
            token,
        });
        // Returns { success: true, message: '...', paymentId: '...' }
        return data;
    } catch (error) {
        throw error;
    }
};
