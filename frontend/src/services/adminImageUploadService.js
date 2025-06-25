// This service handles uploading files to your self-hosted backend.

const API_BASE_URL = '/api/admin/upload';

// This helper is for multipart/form-data requests
async function uploadFilesApi(endpoint, formData, token) {
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
            body: formData,
            headers: headers,
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

// --- NEWLY ADDED FUNCTION ---
// Upload a single image file
export const uploadSingleImage = async (file, token) => {
    const formData = new FormData();
    formData.append('file', file); // 'file' must match the key used in the single upload middleware

    try {
        const data = await uploadFilesApi('/single', formData, token);
        // The backend returns the relative path, e.g., /uploads/images/file-123.jpg
        const backendUrl = window.location.origin.includes('localhost') ? 'http://localhost:5000' : '';
        // Return a full, accessible URL
        return `${backendUrl}${data.data}`;
    } catch (error) {
        throw error;
    }
};


// Upload multiple image files
export const uploadMultipleImages = async (files, token) => {
    const formData = new FormData();
    // 'files' must match the key used in the multer middleware on the backend
    files.forEach(file => {
        formData.append('files', file);
    });

    try {
        const data = await uploadFilesApi('/multiple', formData, token);
        // The backend returns an array of relative paths
        const backendUrl = window.location.origin.includes('localhost') ? 'http://localhost:5000' : '';
        // Return an array of full, accessible URLs
        return data.data.map(path => `${backendUrl}${path}`);
    } catch (error) {
        throw error;
    }
};
