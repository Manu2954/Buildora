// This service handles API calls for creating product reviews.

const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/reviews`;

// Reusable helper for authenticated API requests
async function fetchProtectedApi(endpoint, options = {}) {
    const { token, ...restOptions } = options;
    const headers = {
        'Content-Type': 'application/json',
        ...restOptions.headers,
    };

    const userToken = token || localStorage.getItem('token');

    if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
    } else {
        throw new Error('You must be logged in to perform this action.');
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...restOptions,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data.message || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }
        return data;
    } catch (error) {
        console.error(`API call to ${endpoint} failed:`, error);
        throw error;
    }
}

// Create a new review for a product
export const createReview = async (productId, reviewData, token) => {
    // reviewData: { rating, comment }
    try {
        const data = await fetchProtectedApi(`/product/${productId}`, {
            method: 'POST',
            body: JSON.stringify(reviewData),
            token,
        });
        // Returns { success: true, message: 'Review added' }
        return data;
    } catch (error) {
        throw error;
    }
};
