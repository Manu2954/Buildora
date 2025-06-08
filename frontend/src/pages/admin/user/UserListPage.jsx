import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, deleteUser } from '../../../services/adminUserService';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { Eye, Trash2, Search, AlertTriangle, ChevronLeft, ChevronRight, UserCheck, UserX } from 'lucide-react';

const UserListPage = () => {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ search: '', role: '', page: 1 });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    
    const { token } = useAdminAuth();
    const navigate = useNavigate();

    const fetchUsers = useCallback(async (currentFilters) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getAllUsers(currentFilters, token);
            setUsers(data.users || []);
            setPagination({ currentPage: data.currentPage, totalPages: data.totalPages });
        } catch (err) {
            console.error("Failed to fetch users:", err);
            setError(err.message || "Could not load users.");
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchUsers(filters);
    }, [fetchUsers, filters]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value, page: 1 }));
    };
    
    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.totalPages) return;
        setFilters(prev => ({...prev, page: newPage}));
    }

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete || !token) return;
        try {
            await deleteUser(userToDelete._id, token);
            setShowDeleteModal(false);
            setUserToDelete(null);
            fetchUsers(filters); // Refresh the list
        } catch (err) {
            setError(err.message || "Could not delete user.");
            setShowDeleteModal(false);
        }
    };

    if (isLoading && users.length === 0) {
        return <div className="p-6 text-center">Loading users...</div>;
    }
    
    if (error) {
        return (
             <div className="p-6 text-center text-red-600 bg-red-100 rounded-md">
                <AlertTriangle size={48} className="mx-auto mb-2 text-red-500" />
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="container px-4 py-8 mx-auto">
            <h1 className="mb-6 text-2xl font-semibold text-gray-800">User Management</h1>

            {/* Filter and Search Controls */}
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
                <div className="relative md:col-span-2">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search size={20} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        name="search"
                        placeholder="Search by name or email..."
                        value={filters.search}
                        onChange={handleFilterChange}
                        className="block w-full py-2 pl-10 pr-3 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <select
                        name="role"
                        value={filters.role}
                        onChange={handleFilterChange}
                        className="block w-full py-2 pl-3 pr-10 border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">All Roles</option>
                        <option value="customer">Customer</option>
                        <option value="dealer">Dealer</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Joined</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 capitalize whitespace-nowrap">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                    <button onClick={() => navigate(`/admin/users/${user._id}`)} className="p-1 text-indigo-600 hover:text-indigo-900" title="View & Edit User">
                                        <Eye size={18} />
                                    </button>
                                    <button onClick={() => handleDeleteClick(user)} className="p-1 ml-2 text-red-600 hover:text-red-900" title="Delete User">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
                <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
                    <ChevronLeft size={16} className="mr-1" /> Previous
                </button>
                <span className="text-sm text-gray-700">
                    Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
                    Next <ChevronRight size={16} className="ml-1" />
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
                        <h3 className="mb-4 text-lg font-semibold">Confirm Deletion</h3>
                        <p className="mb-6 text-sm text-gray-600">Are you sure you want to delete the user "{userToDelete?.name}"? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                            <button onClick={confirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserListPage;
