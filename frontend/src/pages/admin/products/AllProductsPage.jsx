
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { getAllProducts } from '../../../services/companyService'; // You'll need to create this service
import { Image as ImageIcon, Edit, AlertCircle } from 'lucide-react';
import Pagination from '../../../components/common/Pagination';
import ImageWithTooltip from '../../../components/common/ImageWithTooltip'; // Import the new component

const AllProductsPage = () => {
    const { token } = useAdminAuth();
    const [data, setData] = useState({ products: [], page: 1, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchAllProducts = useCallback(async (page) => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            const result = await getAllProducts(token, page, 10); // 10 items per page
            setData(result);
        } catch (err) {
            setError(err.message || "Failed to fetch products.");
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchAllProducts(currentPage);
    }, [fetchAllProducts, currentPage]);
    
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800">All Products</h1>
            </div>

            {isLoading && <p>Loading products...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!isLoading && !error && (
                <>
                    <div className="bg-white shadow-md rounded-lg relative overflow-visible">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                                    </tr>
                                </thead>
                                <tbody className="relative overflow-visible bg-white divide-y divide-gray-200">
                                    {data.products.length > 0 ? data.products.map((product) => (
                                        <tr className='relative overflow-visible' key={product._id}>
                                            <td className="px-6 py-4 whitespace-nowrap overflow-visible">
                                                <div className="flex items-center relative overflow-visible">
                                                    {/* <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                                                        {product.images && product.images[0] ? (
                                                            <img className="h-10 w-10 rounded-md object-contain" src={product.images[0]} alt={product.name} />
                                                        ) : (
                                                            <ImageIcon className="h-6 w-6 text-gray-400" />
                                                        )}
                                                    </div> */}
                                                    <ImageWithTooltip src={product.images && product.images[0]} alt={product.name} />
                                                    
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                        <div className="text-sm text-gray-500">{product.sku || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                <Link to={`/admin/companies/${product.company._id}`} className="hover:text-indigo-600">
                                                    {product.company.name}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{product.basePrice.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.quantity}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {product.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link to={`/admin/companies/${product.company._id}/products/edit/${product._id}`} className="text-indigo-600 hover:text-indigo-900">
                                                    <Edit size={18} />
                                                </Link>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7" className="text-center py-10">
                                                <div className="flex flex-col items-center text-gray-500">
                                                    <AlertCircle size={40} className="mb-2"/>
                                                    <p className="font-semibold">No products found.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {data.products.length > 0 && (
                        <Pagination 
                            currentPage={data.page}
                            totalPages={data.totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </>
            )}
        </div>
    );
};

// You'd need to create this API service function
// Example in src/services/productService.js
/*
import api from './api'; // Assuming you have a configured axios instance

export const getAllProducts = async (token, page = 1, limit = 10) => {
    const response = await api.get(`/admin/products/all?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
*/

export default AllProductsPage;