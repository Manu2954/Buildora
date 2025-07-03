// This service handles the bulk product upload API call.

const API_BASE_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/admin/companies` : '/api/admin/companies';

// This helper is different from others as it sends multipart/form-data
// instead of application/json.
async function uploadFileApi(endpoint, formData, token) {
    const headers = {};
    const adminToken = token || localStorage.getItem('adminToken');

    if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
    } else {
        throw new Error('Admin authentication required.');
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            body: formData, // The body is now FormData, not a JSON string
            headers: headers, // Do NOT set Content-Type, the browser will set it automatically for FormData
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data.message || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }
        return data;
    } catch (error) {
        console.error(`File upload to ${endpoint} failed:`, error);
        throw error;
    }
}

// Bulk upload products for a specific company
export const bulkUploadProducts = async (companyId, file, token) => {
    // Create a FormData object to hold the file
    const formData = new FormData();
    formData.append('file', file); // 'file' must match the key used in the multer middleware on the backend

    try {
        const data = await uploadFileApi(`/${companyId}/products/bulk-upload`, formData, token);
        // Returns { success, message, added, failed, errors }
        return data;
    } catch (error) {
        throw error;
    }
};