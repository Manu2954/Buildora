import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getAds, createAd, updateAd, deleteAd } from '../../services/adminAdService';
// Use a named import for ImageUpload to prevent circular dependency errors.
import { ImageUpload, ImagePreview } from '../../components/admin/ImageUpload';
import { Megaphone, Trash2, CheckCircle, EyeOff, AlertTriangle } from 'lucide-react';

const AdManagementPage = () => {
    const [ads, setAds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useAdminAuth();

    // State for the creation form
    const [newName, setNewName] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newLinkTo, setNewLinkTo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for a non-blocking delete confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [adToDelete, setAdToDelete] = useState(null);


    const fetchAds = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAds(token);
            setAds(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch advertisements.');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchAds();
    }, [fetchAds]);

    const handleCreateAd = async (e) => {
        e.preventDefault();
        if (!newName || !newImageUrl || !newLinkTo) {
            setError('Please fill out all fields for the new advertisement.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            await createAd({ name: newName, imageUrl: newImageUrl, linkTo: newLinkTo }, token);
            setNewName('');
            setNewImageUrl('');
            setNewLinkTo('');
            fetchAds(); // Refresh the list
        } catch (err) {
            setError(err.message || 'Failed to create advertisement.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleActive = async (adId, currentStatus) => {
        try {
            await updateAd(adId, { isActive: !currentStatus }, token);
            fetchAds(); // Refresh the list
        } catch (err)
            {setError(err.message || 'Failed to update status.');
        }
    };
    
    // Opens the confirmation modal
    const handleDeleteClick = (ad) => {
        setAdToDelete(ad);
        setShowDeleteModal(true);
    };

    // Performs the actual deletion
    const confirmDeleteAd = async () => {
        if (!adToDelete) return;
        try {
            await deleteAd(adToDelete._id, token);
            fetchAds();
        } catch (err) {
            setError(err.message || 'Failed to delete advertisement.');
        } finally {
            setShowDeleteModal(false);
            setAdToDelete(null);
        }
    };

    return (
        <div className="container px-4 py-8 mx-auto">
            <h1 className="mb-6 text-2xl font-semibold text-gray-800">Advertisement Management</h1>

            {/* Create New Ad Form */}
            <div className="p-6 mb-8 bg-white border rounded-lg shadow-sm">
                <h2 className="mb-4 text-lg font-bold">Create New Banner</h2>
                <form onSubmit={handleCreateAd} className="space-y-4">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium">Banner Name (for internal reference)</label>
                            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" required/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Link URL (where banner clicks go)</label>
                            <input type="url" value={newLinkTo} onChange={(e) => setNewLinkTo(e.target.value)} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" placeholder="https://..." required/>
                        </div>
                    </div>
                    <div>
                         <label className="block text-sm font-medium">Banner Image/GIF</label>
                         {newImageUrl ? (
                             <div className="flex items-center gap-4 mt-2">
                                 <img src={newImageUrl} alt="Preview" className="h-24 border rounded-md"/>
                                 <button type="button" onClick={() => setNewImageUrl('')} className="text-sm text-red-600 hover:underline">Remove</button>
                             </div>
                         ) : (
                             // ✅ FIX: The ImageUpload component now returns two arguments (variantId, url).
                             // We ignore the first one and use the second one (the URL).
                             <ImageUpload onUploadSuccess={(_variantId, url) => setNewImageUrl(url)} />
                         )}
                    </div>
                    <div className="text-right">
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                            {isSubmitting ? 'Creating...' : 'Create Ad'}
                        </button>
                    </div>
                </form>
            </div>

            {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md"><AlertTriangle className="inline mr-2"/> {error}</div>}

            {/* Ads List */}
            <div className="space-y-4">
                {ads.map(ad => (
                    <div key={ad._id} className="flex flex-col items-start gap-4 p-4 bg-white border rounded-lg shadow-sm md:flex-row md:items-center">
                        <img src={ad.imageUrl} alt={ad.name} className="object-contain w-full h-24 border rounded-md md:w-48"/>
                        <div className="flex-grow">
                            <p className="font-bold">{ad.name}</p>
                            <a href={ad.linkTo} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">{ad.linkTo}</a>
                        </div>
                        <div className="flex items-center self-end gap-2 md:self-center">
                            <button onClick={() => handleToggleActive(ad._id, ad.isActive)} className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${ad.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {ad.isActive ? <CheckCircle size={14}/> : <EyeOff size={14}/>} {ad.isActive ? 'Active' : 'Inactive'}
                            </button>
                            <button onClick={() => handleDeleteClick(ad)} className="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600">
                                <Trash2 size={16}/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="p-6 bg-white rounded-lg shadow-xl w-96">
                        <h3 className="mb-4 text-lg font-bold">Confirm Deletion</h3>
                        <p className="mb-6 text-sm text-gray-600">
                            Are you sure you want to delete the ad "<strong>{adToDelete?.name}</strong>"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                                Cancel
                            </button>
                            <button onClick={confirmDeleteAd} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdManagementPage;
