import React, { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { uploadImage } from '../../services/adminImageUploadService';
import { UploadCloud, X } from 'lucide-react';

const ImageUpload = ({ onUploadSuccess, multiple = false }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const { token } = useAdminAuth();

    const handleFileUpload = async (file) => {
        if (!file) return;
        setIsUploading(true);
        setError('');

        try {
            const uploadedUrl = await uploadImage(file, token);
            onUploadSuccess(uploadedUrl, multiple);
        } catch (err) {
            setError(err.message || 'An error occurred during upload.');
        } finally {
            setIsUploading(false);
        }
    };

    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    };
    
    return (
        <div className="w-full">
            <label htmlFor="image-upload" className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="text-center">
                    {isUploading ? (
                        <p className="text-sm text-gray-500">Uploading...</p>
                    ) : (
                        <>
                            <UploadCloud className="w-8 h-8 mx-auto text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600"><span className="font-semibold">Click to upload</span></p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                        </>
                    )}
                </div>
                 <input id="image-upload" type="file" className="sr-only" onChange={onFileChange} accept="image/png, image/jpeg" disabled={isUploading} />
            </label>
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
    );
};

// A component to display the image preview with a delete button
export const ImagePreview = ({ url, onDelete }) => (
    <div className="relative group w-32 h-32">
        <img src={url} alt="Uploaded preview" className="object-cover w-full h-full border rounded-lg"/>
        <button 
            type="button" 
            onClick={() => onDelete(url)} 
            className="absolute top-0 right-0 p-1 text-white transition-opacity bg-red-500 rounded-full opacity-0 cursor-pointer group-hover:opacity-100 transform -translate-y-1/2 translate-x-1/2 hover:bg-red-600"
        >
            <X size={14} />
        </button>
    </div>
);

export default ImageUpload;
