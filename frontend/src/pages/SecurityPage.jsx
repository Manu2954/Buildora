import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserPassword } from '../services/authService';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const SecurityPage = () => {
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match.');
            return;
        }
        if (formData.newPassword.length < 6) {
            setError('New password must be at least 6 characters long.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await updateUserPassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            }, token);
            setSuccess(response.message || 'Password updated successfully!');
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Clear fields
        } catch (err) {
            setError(err.message || 'Failed to update password.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";


    return (
         <div>
            <h1 className="pb-4 mb-6 text-2xl font-bold text-gray-800 border-b">Change Password</h1>
             <form onSubmit={handleSubmit} className="max-w-lg">
                <div className="space-y-6">
                     <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                        <input type="password" name="currentPassword" id="currentPassword" value={formData.currentPassword} onChange={handleChange} className={inputClass} required />
                    </div>
                     <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                        <input type="password" name="newPassword" id="newPassword" value={formData.newPassword} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                        <input type="password" name="confirmPassword" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={inputClass} required />
                    </div>
                </div>

                {error && <div className="flex items-center gap-2 p-3 mt-6 text-sm text-red-700 bg-red-100 rounded-md"><AlertTriangle size={18}/> {error}</div>}
                {success && <div className="flex items-center gap-2 p-3 mt-6 text-sm text-green-700 bg-green-100 rounded-md"><CheckCircle size={18}/> {success}</div>}
                
                <div className="flex justify-end pt-6 mt-6 border-t">
                    <button type="submit" disabled={isLoading} className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                        {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SecurityPage;
