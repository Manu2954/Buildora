import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { getAllProducts } from '../../../services/companyService'; // Ensure this service is created
import { Image as ImageIcon, Edit, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Pagination from '../../../components/common/Pagination';
import ImageWithTooltip from '../../../components/common/ImageWithTooltip';

// --- Helper to group variants by product ---
const groupVariantsByProduct = (variants) => {
    if (!variants || variants.length === 0) {
        return [];
    }

    const grouped = variants.reduce((acc, variant) => {
        const productId = variant.product._id;
        if (!acc[productId]) {
            acc[productId] = {
                ...variant.product, // Copy product details
                company: variant.company, // Copy company details
                isActive: variant.isActive, // Use status from the first variant
                variants: [], // Array to hold all variants of this product
            };
        }
        acc[productId].variants.push(variant);
        return acc;
    }, {});

    return Object.values(grouped);
};


const AllProductsPage = () => {
    const { token } = useAdminAuth();
    const [pageData, setPageData] = useState({ data: [], pagination: { page: 1, totalPages: 1 } });
    const [groupedProducts, setGroupedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedProducts, setExpandedProducts] = useState({});

    const fetchAllProducts = useCallback(async (page) => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            const result = await getAllProducts(token, page, 10); // 10 items per page
            setPageData(result);
            const grouped = groupVariantsByProduct(result.data);
            setGroupedProducts(grouped);
            // Initially expand all products
            const initialExpandedState = grouped.reduce((acc, product) => {
                acc[product._id] = true;
                return acc;
            }, {});
            setExpandedProducts(initialExpandedState);
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

    const toggleProductExpansion = (productId) => {
        setExpandedProducts(prev => ({ ...prev, [productId]: !prev[productId] }));
    };

    const TableSkeleton = () => (
        <tbody>
            {[...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-8"></div></td>
                </tr>
            ))}
        </tbody>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800">All Products</h1>
            </div>

            {error && <p className="text-red-500">{error}</p>}

            <div className="bg-white shadow-md rounded-lg relative overflow-visible">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product / Variant</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                            </tr>
                        </thead>
                        {isLoading ? <TableSkeleton /> : (
                        <tbody className="bg-white divide-y divide-gray-200">
                            {groupedProducts.length > 0 ? groupedProducts.map((product) => (
                                <React.Fragment key={product._id}>
                                    {/* --- Main Product Row --- */}
                                    <tr className="bg-gray-50 hover:bg-gray-100">
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                                            <div className="flex items-center">
                                                <button onClick={() => toggleProductExpansion(product._id)} className="mr-2">
                                                    {expandedProducts[product._id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </button>
                                                {product.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            <Link to={`/admin/companies/${product.company._id}`} className="hover:text-indigo-600">
                                                {product.company.name}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                        <td colSpan="2"></td>
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
                                    {/* --- Variant Rows (conditionally rendered) --- */}
                                    {expandedProducts[product._id] && product.variants.map(variant => (
                                        <tr key={variant._id}>
                                            <td className="pl-12 pr-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <ImageWithTooltip src={variant.images && variant.images[0]} alt={variant.variantName} />
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-800">{variant.variantName}</div>
                                                        <div className="text-xs text-gray-500">SKU: {variant.sku || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td colSpan="2"></td> {/* Empty cells to align with product row */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{variant.ourPrice.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{variant.stock}</td>
                                            <td colSpan="2"></td> {/* Empty cells */}
                                        </tr>
                                    ))}
                                </React.Fragment>
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
                        )}
                    </table>
                </div>
            </div>
            {pageData.data && pageData.data.length > 0 && (
                <Pagination 
                    currentPage={pageData.pagination.page}
                    totalPages={pageData.pagination.totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default AllProductsPage;
