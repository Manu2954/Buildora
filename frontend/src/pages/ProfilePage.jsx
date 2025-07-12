import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserDetails } from '../services/authService';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const ProfilePage = () => {
    const { user, token, login } = useAuth(); // We need login to update the context after a change
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: { street: '', city: '', state: '', postalCode: '', country: 'India' }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                address: user.address || { street: '', city: '', state: '', postalCode: '', country: 'India' }
            });
        }
    }, [user]);
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddressChange = (e) => {
        setFormData({ ...formData, address: { ...formData.address, [e.target.name]: e.target.value }});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await updateUserDetails(formData, token);
            // The API returns the updated user object. We use it to update our AuthContext.
            login({ data: response.data, token: token }); // Re-login with new user data to update context
            setSuccess('Profile updated successfully!');
        } catch (err) {
            setError(err.message || 'Failed to update profile.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const inputClass = "block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";


    return (
        <div>
            <h1 className="pb-4 mb-6 text-2xl font-bold text-gray-800 border-b">Profile Settings</h1>
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Personal Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                        <div className="grid grid-cols-1 gap-6 mt-4 md:grid-cols-2">
                             <div><label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label><input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={inputClass} /></div>
                             <div><label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label><input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={inputClass} /></div>
                        </div>
                    </div>
                    {/* Shipping Address */}
                     <div>
                        <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
                        <div className="grid grid-cols-1 gap-6 mt-4 md:grid-cols-2">
                             <div><label htmlFor="address" className="block text-sm font-medium text-gray-700">Street</label><input type="text" name="address" id="address" value={formData.address.address} onChange={handleAddressChange} className={inputClass} /></div>
                            <div><label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label><input type="text" name="city" id="city" value={formData.address.city} onChange={handleAddressChange} className={inputClass} /></div>
                            <div><label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label><input type="text" name="state" id="state" value={formData.address.state} onChange={handleAddressChange} className={inputClass} /></div>
                             <div><label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label><input type="text" name="postalCode" id="postalCode" value={formData.address.postalCode} onChange={handleAddressChange} className={inputClass} /></div>
                        </div>
                    </div>
                </div>

                 {error && <div className="flex items-center gap-2 p-3 mt-6 text-sm text-red-700 bg-red-100 rounded-md"><AlertTriangle size={18}/> {error}</div>}
                 {success && <div className="flex items-center gap-2 p-3 mt-6 text-sm text-green-700 bg-green-100 rounded-md"><CheckCircle size={18}/> {success}</div>}
                
                <div className="flex justify-end pt-6 mt-6 border-t">
                    <button type="submit" disabled={isLoading} className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfilePage;
