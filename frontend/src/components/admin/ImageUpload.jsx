import React, { useRef, useState, useMemo } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { uploadSingleImage } from '../../services/adminImageUploadService';

// --- ImagePreview Component ---
export const ImagePreview = ({ url, onDelete }) => (
    <div className="relative w-24 h-24 group">
        <img
            src={url}
            alt="Uploaded preview"
            className="object-cover w-full h-full border border-gray-300 rounded-md"
        />
        <button
            type="button"
            onClick={onDelete}
            className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 transition-opacity bg-red-600 rounded-full opacity-0 group-hover:opacity-100"
            aria-label="Delete image"
        >
            <X className="w-4 h-4 text-white" />
        </button>
    </div>
);


// --- ImageUpload Component (Main Component) ---
// ✅ FIX: Changed from a default export to a named export to prevent circular dependency issues.
export const ImageUpload = ({ onUploadSuccess, inputId, variantId }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    const { token } = useAdminAuth();

    const uniqueId = useMemo(() => inputId || `file-upload-${crypto.randomUUID()}`, [inputId]);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setError('');

        try {
            const uploadedUrl = await uploadSingleImage(file, token);
            onUploadSuccess(variantId, uploadedUrl);
        } catch (err) {
            console.error("Upload failed:", err);
            setError(err.message || 'An error occurred during upload.');
        } finally {
            setIsUploading(false);
            if(fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="flex flex-col items-center">
            <label
                htmlFor={uniqueId}
                className={`flex flex-col items-center justify-center w-24 h-24 text-gray-500 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-100 hover:border-indigo-400 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isUploading ? (
                    <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <>
                        <UploadCloud size={24} />
                        <span className="mt-1 text-xs text-center">Upload</span>
                    </>
                )}
            </label>
            <input
                id={uniqueId}
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/gif, image/webp"
                disabled={isUploading}
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
};

// Note: No default export is used.
