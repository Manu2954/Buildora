import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getUserById, updateUser } from '../../../services/adminUserService';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { AlertTriangle, Mail, Phone, MapPin, User, Tag, Calendar, CheckCircle, XCircle } from 'lucide-react';

const ViewUserPage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { token } = useAdminAuth();

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');

    const fetchUserDetails = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getUserById(userId, token);
            setUser(data);
        } catch (err) {
            setError(err.message || 'Could not load user details.');
        } finally {
            setIsLoading(false);
        }
    }, [userId, token]);

    useEffect(() => {
        fetchUserDetails();
    }, [fetchUserDetails]);

    const handleUpdate = async (field, value) => {
        setIsUpdating(true);
        setError(null);
        setSuccess('');
        try {
            const updatedUser = await updateUser(userId, { [field]: value }, token);
            setUser(updatedUser); // Update local state with response from API
            setSuccess(`User ${field} updated successfully!`);
        } catch (err) {
            setError(err.message || `Failed to update ${field}.`);
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return <div className="p-6 text-center">Loading user details...</div>;
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-600 bg-red-100 rounded-md">
                <AlertTriangle size={48} className="mx-auto mb-2 text-red-500" />
                <p>{error}</p>
                <Link to="/admin/users" className="mt-4 text-indigo-600 hover:underline">Back to User List</Link>
            </div>
        );
    }
    
    if (!user) return null;

    const renderDetailItem = (Icon, label, value) => (
        <div className="flex items-center py-2">
            <Icon size={20} className="mr-4 text-gray-500 flex-shrink-0" />
            <div>
                <span className="block text-xs font-medium text-gray-500">{label}</span>
                <span className="text-sm text-gray-900">{value}</span>
            </div>
        </div>
    );

    return (
        <div className="container px-4 py-8 mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">User Profile</h1>
                 <Link to="/admin/users" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    Back to List
                </Link>
            </div>
            
             {success && (
                <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 border border-green-300 rounded-md">
                    {success}
                </div>
            )}
             {error && !isLoading && (
                 <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* Left Column: User Details */}
                <div className="p-6 bg-white rounded-lg shadow md:col-span-2">
                    <div className="flex items-center pb-4 mb-4 border-b">
                        <div className="flex-shrink-0 w-16 h-16 mr-4 bg-indigo-100 rounded-full flex items-center justify-center">
                            <User size={32} className="text-indigo-600"/>
                        </div>
                        <div>
                             <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                             <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {renderDetailItem(Tag, "Role", <span className="capitalize">{user.role}</span>)}
                        {renderDetailItem(user.isActive ? CheckCircle : XCircle, "Account Status", user.isActive ? 'Active' : 'Inactive')}
                        {renderDetailItem(user.isVerified ? CheckCircle : XCircle, "Email Verified", user.isVerified ? 'Yes' : 'No')}
                        {renderDetailItem(Calendar, "Date Joined", new Date(user.createdAt).toLocaleDateString())}
                        {user.lastLogin && renderDetailItem(Calendar, "Last Login", new Date(user.lastLogin).toLocaleString())}
                        {user.address && renderDetailItem(MapPin, "Address", `${user.address.street || ''}, ${user.address.city || ''}`)}
                    </div>
                </div>

                {/* Right Column: Admin Actions */}
                <div className="p-6 space-y-6 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-800">Admin Actions</h3>
                    {/* Change Role */}
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Change Role</label>
                        <select
                            id="role"
                            value={user.role}
                            onChange={(e) => handleUpdate('role', e.target.value)}
                            disabled={isUpdating}
                            className="block w-full py-2 pl-3 pr-10 mt-1 border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="customer">Customer</option>
                            <option value="dealer">Dealer</option>
                        </select>
                    </div>

                    {/* Deactivate/Activate Account */}
                    <div>
                        <h4 className="block text-sm font-medium text-gray-700">Account Status</h4>
                        <div className="mt-2">
                            {user.isActive ? (
                                <button onClick={() => handleUpdate('isActive', false)} disabled={isUpdating} className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-300">
                                    Deactivate Account
                                </button>
                            ) : (
                                <button onClick={() => handleUpdate('isActive', true)} disabled={isUpdating} className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300">
                                    Activate Account
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewUserPage;
