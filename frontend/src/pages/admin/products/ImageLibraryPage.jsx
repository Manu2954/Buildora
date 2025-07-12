import React, { useState } from 'react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { uploadMultipleImages } from '../../../services/adminImageUploadService';
import { UploadCloud, Copy, Check, AlertTriangle } from 'lucide-react';

const ImageLibraryPage = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [uploadedUrls, setUploadedUrls] = useState([]);
    const [copiedUrl, setCopiedUrl] = useState('');
    const { token } = useAdminAuth();

    const handleFilesUpload = async (files) => {
        if (!files || files.length === 0) return;
        
        setIsUploading(true);
        setError('');
        
        try {
            const newUrls = await uploadMultipleImages(Array.from(files), token);
            setUploadedUrls(prev => [...newUrls, ...prev]); // Add new URLs to the top of the list
        } catch (err) {
            setError(err.message || 'An error occurred during upload.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = (e) => {
        handleFilesUpload(e.target.files);
    };
    
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleFilesUpload(e.dataTransfer.files);
    };

    const handleCopyToClipboard = (url) => {
        // Create a temporary textarea to use the copy command
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(''), 2000); // Reset after 2 seconds
    };

    return (
        <div className="container px-4 py-8 mx-auto">
            <h1 className="mb-2 text-2xl font-semibold text-gray-800">Image Library</h1>
            <p className="mb-6 text-sm text-gray-500">Upload multiple images here to get their URLs for your bulk upload CSV file.</p>
            
            {/* Uploader Component */}
            <div 
                className="w-full p-6 text-center border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                <input id="multi-image-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" multiple disabled={isUploading} />
                <label htmlFor="multi-image-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                    <UploadCloud size={48} className="text-gray-400"/>
                    <p className="mt-2 text-sm font-semibold text-gray-600">Drag & drop files or click to upload</p>
                    <p className="text-xs text-gray-500">You can upload up to 20 images at a time.</p>
                </label>
            </div>
            
            {isUploading && <p className="mt-4 text-center text-indigo-600">Uploading...</p>}
            {error && <div className="flex items-center gap-2 p-3 mt-4 text-sm text-red-700 bg-red-100 rounded-md"><AlertTriangle size={18}/> {error}</div>}

            {/* Uploaded Images Gallery */}
            {uploadedUrls.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-lg font-bold">Uploaded Image URLs</h2>
                    <div className="grid grid-cols-2 gap-4 mt-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {uploadedUrls.map((url, index) => (
                            <div key={index} className="relative p-2 border rounded-lg group">
                                <img src={url} alt={`Uploaded ${index + 1}`} className="object-contain w-full h-32"/>
                                <button
                                    onClick={() => handleCopyToClipboard(url)}
                                    className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                                >
                                    {copiedUrl === url ? <Check size={14}/> : <Copy size={14}/>}
                                    {copiedUrl === url ? 'Copied!' : 'Copy URL'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageLibraryPage;
