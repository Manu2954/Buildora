// This service handles all public API calls for the customer storefront.

const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/storefront`;
console.log(API_BASE_URL)
async function fetchPublicApi(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
            const errorMessage = data.message || `HTTP error! Status: ${response.status}`;
            throw new Error(errorMessage);
        }
        
        return data;

    } catch (error) {
        console.error(`Public API call to ${endpoint} failed:`, error.message);
        throw error;
    }
}

// Get all products with advanced filtering
export const getProducts = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    try {
        const data = await fetchPublicApi(`/products?${query}`);
        return data;
    } catch (error) {
        console.error('Failed to fetch products:', error);
        throw error;
    }
};

// Get all available filter options (categories, companies)
export const getFilterOptions = async () => {
    try {
        const data = await fetchPublicApi(`/filters`);
        console.log(data)
        return data.data; // Return the nested data object { categories: [], companies: [] }
    } catch (error) {
        console.error('Failed to fetch filter options:', error);
        throw error;
    }
};


// Get a single product by its ID
export const getProductById = async (productId) => {
    try {
        const data = await fetchPublicApi(`/products/${productId}`);
        return data.data;
    } catch (error) {
        console.error(`Failed to fetch product with ID ${productId}:`, error);
        throw error;
    }
};
