// This service will interact with the /api/admin/companies endpoints

const API_BASE_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/admin` : '/api/admin';

// Reusable helper function for API requests, similar to adminAuthService
// Ensure you have a mechanism to get the admin token (e.g., from AdminAuthContext or localStorage)
async function fetchAdminApi(endpoint, options = {}) {
    const { token, ...restOptions } = options;
    const headers = {
        'Content-Type': 'application/json',
        ...restOptions.headers,
    };

    const adminToken = token || localStorage.getItem('adminToken'); // Fallback to localStorage if not passed directly

    if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
    } else {
        // Handle cases where token is not available, perhaps redirect to login or throw specific error
        console.error('Admin token not available for API call to', endpoint);
        throw new Error('Authentication required. Please login.');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...restOptions,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        const errorMessage = data.message || `HTTP error! status: ${response.status}`;
        console.error(`API Error (${endpoint}):`, errorMessage, data.errors || '');
        const error = new Error(errorMessage);
        error.data = data;
        error.status = response.status;
        throw error;
    }
    return data;
}

// 2.1. Create New Company
export const createCompany = async (companyData, token) => {
    // companyData: { name, description?, logoUrl?, address?, contactEmail?, contactPhone?, website? }
    try {
        const data = await fetchAdminApi('/companies', {
            method: 'POST',
            body: JSON.stringify(companyData),
            token: token,
        });
        return data; // Returns the newly created company object
    } catch (error) {
        console.error('Create company failed:', error);
        throw error;
    }
};

// 2.2. Get All Companies
export const getAllCompanies = async (token) => {
    try {
        const data = await fetchAdminApi('/companies', {
            method: 'GET',
            token: token,
        });
        return data; // Returns an array of company objects
    } catch (error) {
        console.error('Get all companies failed:', error);
        throw error;
    }
};

// 2.3. Get Single Company by ID
export const getCompanyById = async (companyId, token) => {
    try {
        const data = await fetchAdminApi(`/companies/${companyId}`, {
            method: 'GET',
            token: token,
        });
        return data; // Returns the company object
    } catch (error) {
        console.error(`Get company by ID (${companyId}) failed:`, error);
        throw error;
    }
};

// 2.4. Update Company Details
export const updateCompany = async (companyId, companyData, token) => {
    try {
        const data = await fetchAdminApi(`/companies/${companyId}`, {
            method: 'PUT',
            body: JSON.stringify(companyData),
            token: token,
        });
        return data; // Returns the updated company object
    } catch (error) {
        console.error(`Update company (${companyId}) failed:`, error);
        throw error;
    }
};

// 2.5. Delete Company
export const deleteCompany = async (companyId, token) => {
    try {
        const data = await fetchAdminApi(`/companies/${companyId}`, {
            method: 'DELETE',
            token: token,
        });
        return data; // Returns { message: "Company removed successfully" }
    } catch (error) {
        console.error(`Delete company (${companyId}) failed:`, error);
        throw error;
    }
};


// --- Product Management within a Company ---
// (Endpoints: /companies/:companyId/products)

// 3.1. Add Product to Company
export const addProductToCompany = async (companyId, productData, token) => {
    try {
        const data = await fetchAdminApi(`/companies/${companyId}/products`, {
            method: 'POST',
            body: JSON.stringify(productData),
            token: token,
        });
        return data; // Returns the newly added product object
    } catch (error) {
        console.error(`Add product to company (${companyId}) failed:`, error);
        throw error;
    }
};

// 3.2. Get All Products for a Company
export const getProductsForCompany = async (companyId, token) => {
    try {
        // The API doc returns an object: { companyName, products: [] }
        // Adjust if your service layer should only return the products array
        const data = await fetchAdminApi(`/companies/${companyId}/products`, {
            method: 'GET',
            token: token,
        });
        return data; 
    } catch (error) {
        console.error(`Get products for company (${companyId}) failed:`, error);
        throw error;
    }
};

// 3.3. Get Single Product by ID within a Company
export const getProductInCompany = async (companyId, productId, token) => {
    try {
        const data = await fetchAdminApi(`/companies/${companyId}/products/${productId}`, {
            method: 'GET',
            token: token,
        });
        return data; // Returns the product object
    } catch (error) {
        console.error(`Get product (${productId}) in company (${companyId}) failed:`, error);
        throw error;
    }
};

// 3.4. Update Product in Company
export const updateProductInCompany = async (companyId, productId, productData, token) => {
    try {
        const data = await fetchAdminApi(`/companies/${companyId}/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(productData),
            token: token,
        });
        return data; // Returns the updated product object
    } catch (error) {
        console.error(`Update product (${productId}) in company (${companyId}) failed:`, error);
        throw error;
    }
};

// 3.5. Remove Product from Company
export const removeProductFromCompany = async (companyId, productId, token) => {
    try {
        const data = await fetchAdminApi(`/companies/${companyId}/products/${productId}`, {
            method: 'DELETE',
            token: token,
        });
        return data; // Returns { message: "Product removed successfully" }
    } catch (error) {
        console.error(`Remove product (${productId}) from company (${companyId}) failed:`, error);
        throw error;
    }
};

export const getAllProducts = async (token, page = 1, limit = 10) => {
    const response = await fetchAdminApi(`/products/all?page=${page}&limit=${limit}`, {
         method: 'GET',
            token: token,
    });
    console.log(response)
    return response;
};