// This service handles uploading files to your self-hosted backend.

const API_BASE_URL = '/api/admin/upload';

// This helper is different from others as it sends multipart/form-data
async function uploadFileApi(formData, token) {
    const headers = {};
    const adminToken = token || localStorage.getItem('adminToken');

    if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
    } else {
        throw new Error('Admin authentication required.');
    }

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            body: formData,
            headers: headers, // Do NOT set Content-Type, the browser sets it for FormData
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data.message || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }
        return data;
    } catch (error) {
        console.error(`File upload failed:`, error);
        throw error;
    }
}

// Upload a single image file
export const uploadImage = async (file, token) => {
    // Create a FormData object to hold the file
    const formData = new FormData();
    formData.append('file', file); // 'file' must match the key used in the multer middleware

    try {
        const data = await uploadFileApi(formData, token);
        // The backend returns the relative path, e.g., /uploads/images/file-123.jpg
        // We prepend the backend URL to make it a full, accessible URL.
        const backendUrl = window.location.origin.includes('localhost') ? 'http://localhost:5000' : ''; // Adjust if your production URL is different
        return `${backendUrl}${data.data}`;
    } catch (error) {
        throw error;
    }
};
