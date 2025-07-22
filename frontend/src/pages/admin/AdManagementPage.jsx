import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getAds, createAd, updateAd, deleteAd } from '../../services/adminAdService';
import ImageUpload from '../../components/admin/ImageUpload';
import { Megaphone, Trash2, CheckCircle, Eye, EyeOff, AlertTriangle } from 'lucide-react';

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
        } catch (err) {
            setError(err.message || 'Failed to update status.');
        }
    };
    
    const handleDeleteAd = async (adId) => {
        if(window.confirm('Are you sure you want to delete this advertisement?')) {
            try {
                await deleteAd(adId, token);
                fetchAds();
            } catch (err) {
                setError(err.message || 'Failed to delete advertisement.');
            }
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
                                <img src={`${process.env.REACT_APP_API_URL}${newImageUrl}`} alt="Preview" className="h-24 border rounded-md"/>
                                <button type="button" onClick={() => setNewImageUrl('')} className="text-sm text-red-600 hover:underline">Remove</button>
                             </div>
                         ) : (
                            <ImageUpload onUploadSuccess={(url) => setNewImageUrl(url)} />
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
                        <img src={`${process.env.REACT_APP_API_URL}${ad.imageUrl}`} alt={ad.name} className="object-contain w-full h-24 border rounded-md md:w-48"/>
                        <div className="flex-grow">
                            <p className="font-bold">{ad.name}</p>
                            <a href={ad.linkTo} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">{ad.linkTo}</a>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleToggleActive(ad._id, ad.isActive)} className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${ad.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {ad.isActive ? <CheckCircle size={14}/> : <EyeOff size={14}/>} {ad.isActive ? 'Active' : 'Inactive'}
                            </button>
                            <button onClick={() => handleDeleteAd(ad._id)} className="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600">
                                <Trash2 size={16}/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdManagementPage;
