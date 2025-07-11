// This service handles all public API calls for the customer storefront.

const API_BASE_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/storefront` : '/api/storefront';

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


// Log a search term
export const logSearchTerm = async (term) => {
    if (!term || term.trim() === '') return;
    try {
        // This is a "fire and forget" request, we don't need to wait for the response
        const logUrl = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/logs/search` : '/api/logs/search';
        fetch(logUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ term }),
        });
    } catch (error) {
        // Don't block the user experience if logging fails
        console.error("Failed to log search term:", error);
    }
};

export const getRelatedProducts = async (productId, category) => {
    try {
        // We use encodeURIComponent to handle special characters in category names
        const encodedCategory = encodeURIComponent(category);
        const data = await fetchPublicApi(`/related-products/${productId}?category=${encodedCategory}`);
        return data.data; // Return the array of related products
    } catch (error) {
        console.error(`Failed to fetch related products:`, error);
        // Return an empty array on failure to prevent the page from crashing
        return [];
    }
};

// Get all data needed for the dynamic homepage
export const getHomePageData = async () => {
    try {
        const data = await fetchPublicApi(`/homepage`);
        return data.data; // Return the nested data object { featuredCategories, bestsellingProducts, newArrivals }
    } catch (error) {
        console.error('Failed to fetch homepage data:', error);
        // Return an empty object on failure to prevent the page from crashing
        return { featuredCategories: [], bestsellingProducts: [], newArrivals: [] };
    }
};