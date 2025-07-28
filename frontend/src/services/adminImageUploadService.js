// // This service handles uploading files to your self-hosted backend.

// const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/admin/upload`;

// // This helper is for multipart/form-data requests
// async function uploadFilesApi(endpoint, formData, token) {
//     const headers = {};
//     const adminToken = token || localStorage.getItem('adminToken');

//     if (adminToken) {
//         headers['Authorization'] = `Bearer ${adminToken}`;
//     } else {
//         throw new Error('Admin authentication required.');
//     }

//     try {
//         const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//             method: 'POST',
//             body: formData,
//             headers: headers,
//         });

//         const data = await response.json();

//         if (!response.ok) {
//             const errorMessage = data.message || `HTTP error! status: ${response.status}`;
//             throw new Error(errorMessage);
//         }
//         return data;
//     } catch (error) {
//         console.error(`File upload to ${endpoint} failed:`, error);
//         throw error;
//     }
// }

// // --- NEWLY ADDED FUNCTION ---
// // Upload a single image file
// export const uploadSingleImage = async (file, token) => {
//     const formData = new FormData();
//     formData.append('file', file); // 'file' must match the key used in the single upload middleware

//     try {
//         const data = await uploadFilesApi('/single', formData, token);
//         // The backend returns the relative path, e.g., /uploads/images/file-123.jpg
//         const backendUrl = window.location.origin.includes('localhost') ? `${process.env.REACT_APP_API_URL}` : '';
//         // Return a full, accessible URL
//         return `${backendUrl}${data.data}`;
//     } catch (error) {
//         throw error;
//     }
// };


// // Upload multiple image files
// export const uploadMultipleImages = async (files, token) => {
//     const formData = new FormData();
//     // 'files' must match the key used in the multer middleware on the backend
//     files.forEach(file => {
//         formData.append('files', file);
//     });

//     try {
//         const data = await uploadFilesApi('/multiple', formData, token);
//         // The backend returns an array of relative paths
//         const backendUrl = window.location.origin.includes('localhost') ? 'http://localhost:5000' : '';
//         // Return an array of full, accessible URLs
//         return data.data.map(path => `${backendUrl}${path}`);
//     } catch (error) {
//         throw error;
//     }
// };

// frontend/src/services/uploadService.js// Path: frontend/src/services/uploadService.js

// import api from './api'; // Your configured axios instance
import axios from 'axios';

/**
 * Uploads a single image file.
 * @param {File} file - The image file to upload.
 * @param {string} token - The admin authentication token.
 * @returns {Promise<string>} The public URL of the uploaded image.
 */

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api/v1`, // change to your actual backend URL
  withCredentials: true // needed for refresh token cookies
});

// const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/v1`;
export const uploadSingleImage = async (file, token) => {
    // Create a FormData object to properly handle the file payload
    const formData = new FormData();
    formData.append('file', file);

    try {
        // Make a POST request to YOUR backend's secure upload endpoint
        const response = await api.post('/upload/image', formData, {
            headers: {
                // This header is crucial for file uploads
                'Content-Type': 'multipart/form-data',
                // Include the admin auth token to pass the `protect` middleware
                Authorization: `Bearer ${token}`,
            },
        });

        // Check for a successful response and return the public URL provided by the backend
        if (response.data && response.data.success) {
            return response.data.url;
        } else {
            // If the backend indicates failure, throw an error
            throw new Error(response.data.message || 'Upload failed due to an unknown error.');
        }
    } catch (error) {
        console.error('Error in uploadSingleImage service:', error);
        // Re-throw a clean error message for the component to catch and display
        throw error.response?.data || error;
    }
};


/**
 * Uploads multiple image files.
 * @param {File[]} files - An array of image files to upload.
 * @param {string} token - The admin authentication token.
 * @returns {Promise<string[]>} An array of public URLs for the uploaded images.
 */
export const uploadMultipleImages = async (files, token) => {
    const formData = new FormData();
    // The backend `upload.array('files', 10)` expects the field name to be 'files'
    files.forEach(file => {
        formData.append('files', file);
    });

    try {
        // Make a POST request to the multiple image upload endpoint
        const response = await api.post('/upload/images', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
            },
        });

        // The backend returns the URLs in a `urls` property
        if (response.data && response.data.success) {
            return response.data.urls;
        } else {
            throw new Error(response.data.message || 'Multiple image upload failed.');
        }
    } catch (error) {
        console.error('Error in uploadMultipleImages service:', error);
        throw error.response?.data || error;
    }
};
