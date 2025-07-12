import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllCompanies, deleteCompany } from '../../../services/companyService';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { PlusCircle, Edit3, Trash2, Eye, Search, AlertTriangle } from 'lucide-react'; // Icons

const CompanyListPage = () => {
    const [companies, setCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [companyToDelete, setCompanyToDelete] = useState(null);
    
    const { token } = useAdminAuth();
    const navigate = useNavigate();

    const fetchCompanies = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getAllCompanies(token);
            setCompanies(data || []); // Ensure data is an array
        } catch (err) {
            console.error("Failed to fetch companies:", err);
            setError(err.message || "Could not load companies.");
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchCompanies();
        } else {
            // Handle case where token is not yet available (e.g., initial load)
            // Or if auth context itself is loading, wait for it.
            // For now, assume token is present or auth context handles loading state.
             setIsLoading(false);
             setError("Admin token not available. Please login again.");
        }
    }, [fetchCompanies, token]);

    const handleDeleteClick = (company) => {
        setCompanyToDelete(company);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!companyToDelete || !token) return;
        try {
            await deleteCompany(companyToDelete._id, token);
            // Optionally show success toast/message
            setShowDeleteModal(false);
            setCompanyToDelete(null);
            fetchCompanies(); // Refresh the list
        } catch (err) {
            console.error("Failed to delete company:", err);
            // Show error toast/message
            setError(err.message || "Could not delete company.");
            setShowDeleteModal(false); // Close modal even on error
        }
    };

    const filteredCompanies = companies.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.contactEmail && company.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <svg className="w-10 h-10 mr-3 -ml-1 text-indigo-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-700">Loading companies...</p>
            </div>
        );
    }

    // This error display covers API errors and token issues more prominently
    if (error && !isLoading) { // Show error only if not loading, to prevent flicker
        return (
            <div className="p-6 text-center text-red-600 bg-red-100 border border-red-300 rounded-md">
                <AlertTriangle size={48} className="mx-auto mb-2 text-red-500" />
                <p className="text-xl font-semibold">Error loading companies</p>
                <p>{error}</p>
                <button 
                    onClick={fetchCompanies}
                    className="px-4 py-2 mt-4 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    Try Again
                </button>
            </div>
        );
    }


    return (
        <div className="container px-4 py-8 mx-auto">
            <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
                <h1 className="text-2xl font-semibold text-gray-800">Company Management</h1>
                <Link
                    to="/admin/companies/add"
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <PlusCircle size={18} className="mr-2" /> Add New Company
                </Link>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search size={20} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search companies by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full py-2 pl-10 pr-3 leading-5 placeholder-gray-500 bg-white border border-gray-300 rounded-md focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            {/* Companies Table/List */}
            {filteredCompanies.length === 0 && !isLoading ? (
                <div className="py-10 text-center text-gray-500">
                    <p className="mb-2 text-lg">No companies found.</p>
                    {searchTerm && <p>Try adjusting your search terms.</p>}
                     {!searchTerm && !error && <p>Click "Add New Company" to get started.</p>}
                </div>

            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Name</th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Contact Email</th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Products</th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCompanies.map((company) => (
                                <tr key={company._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{company.name}</div>
                                        {company.website && <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800">{company.website}</a>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{company.contactEmail || 'N/A'}</div>
                                        <div className="text-xs text-gray-500">{company.contactPhone || ''}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            company.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {company.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {/* Based on API, products are fetched separately. Link to view company details which will show products. */}
                                        <Link to={`/admin/companies/${company._id}`} className="text-indigo-600 hover:text-indigo-900">
                                            View Products ({company.products?.length || 0})
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                        <button onClick={() => navigate(`/admin/companies/${company._id}`)} className="p-1 text-indigo-600 hover:text-indigo-900" title="View Details">
                                            <Eye size={18} />
                                        </button>
                                        <button onClick={() => navigate(`/admin/companies/edit/${company._id}`)} className="p-1 ml-2 text-blue-600 hover:text-blue-900" title="Edit Company">
                                            <Edit3 size={18} />
                                        </button>
                                        <button onClick={() => handleDeleteClick(company)} className="p-1 ml-2 text-red-600 hover:text-red-900" title="Delete Company">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && companyToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Confirm Deletion</h3>
                        <p className="mb-6 text-sm text-gray-600">
                            Are you sure you want to delete the company "<strong>{companyToDelete.name}</strong>"? 
                            This action will also remove all its associated products and cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => { setShowDeleteModal(false); setCompanyToDelete(null); }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyListPage;
