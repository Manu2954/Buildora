import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    getCompanyById,
    getProductsForCompany,
    removeProductFromCompany,
} from "../../../services/companyService";
import { useAdminAuth } from "../../../context/AdminAuthContext";
import {
    Building,
    Mail,
    Phone,
    Globe,
    MapPin,
    Edit3,
    Trash2,
    PlusCircle,
    Package,
    AlertTriangle,
    ChevronLeft,
    ChevronDown,
    ChevronUp,
    Image as ImageIcon,
} from "lucide-react";
import ImageWithTooltip from '../../../components/common/ImageWithTooltip';

const ViewCompanyPage = () => {
    const { companyId } = useParams();
    const navigate = useNavigate();
    const { token } = useAdminAuth();

    const [company, setCompany] = useState(null);
    const [productsData, setProductsData] = useState({ companyName: "", products: [] });
    const [isLoadingCompany, setIsLoadingCompany] = useState(true);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteProductModal, setShowDeleteProductModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [expandedProducts, setExpandedProducts] = useState({});

    const toggleProductExpansion = (productId) => {
        setExpandedProducts(prev => ({ ...prev, [productId]: !prev[productId] }));
    };

    const fetchCompanyAndProducts = useCallback(async () => {
        if (!token || !companyId) return;

        setIsLoadingCompany(true);
        setError(null);

        try {
            // --- Step 1: Fetch Company Details First ---
            const companyResponse = await getCompanyById(companyId, token);
            console.log(companyResponse)
            const companyDetails = companyResponse; // ✅ FIX: Correctly access the data object
            setCompany(companyDetails);
            setIsLoadingCompany(false);

            // --- Step 2: Then Fetch Products ---
            setIsLoadingProducts(true);
            const productsResponse = await getProductsForCompany(companyId, token);
            const productsPayload = productsResponse.data || { companyName: companyDetails.name, products: [] };
            setProductsData(productsPayload);
            
            if (productsPayload.products) {
                const initialExpandedState = productsPayload.products.reduce((acc, product) => {
                    acc[product._id] = true;
                    return acc;
                }, {});
                setExpandedProducts(initialExpandedState);
            }
        } catch (err) {
            console.error("Failed to fetch company data:", err);
            setError(err.response?.data?.message || err.message || "Could not load company details.");
            setIsLoadingCompany(false); // Ensure loading stops on error
        } finally {
            setIsLoadingProducts(false); // Ensure product loading stops
        }
    }, [companyId, token]);


    useEffect(() => {
        fetchCompanyAndProducts();
    }, [fetchCompanyAndProducts]);

    const handleDeleteProductClick = (product) => {
        setProductToDelete(product);
        setShowDeleteProductModal(true);
    };

    const confirmDeleteProduct = async () => {
        if (!productToDelete || !companyId || !token) return;
        try {
            await removeProductFromCompany(companyId, productToDelete._id, token);
            setShowDeleteProductModal(false);
            setProductToDelete(null);
            // Refresh products list after deletion
            const productsResponse = await getProductsForCompany(companyId, token);
            setProductsData(productsResponse.data || { companyName: company?.name || "N/A", products: [] });
        } catch (err) {
            console.error("Failed to delete product:", err);
            setError(err.response?.data?.message || "Could not delete product.");
            setShowDeleteProductModal(false);
        }
    };

    const renderDetailItem = (IconComponent, label, value, isLink = false) => {
        if (!value) return null;
        return (
            <div className="flex items-start py-2">
                <IconComponent size={20} className="mr-3 text-indigo-500 flex-shrink-0 mt-1" />
                <div>
                    <span className="block text-sm font-medium text-gray-500">{label}</span>
                    {isLink ? (
                        <a href={value.startsWith("http") ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">{value}</a>
                    ) : (
                        <span className="text-sm text-gray-900">{value}</span>
                    )}
                </div>
            </div>
        );
    };

    if (isLoadingCompany) {
        return <div className="flex items-center justify-center h-screen"><p>Loading Company Details...</p></div>;
    }

    if (error && !company) {
        return (
             <div className="container px-4 py-8 mx-auto">
                <div className="p-8 text-center text-red-700 bg-red-100 border-2 border-red-300 rounded-lg shadow-md">
                    <AlertTriangle size={56} className="mx-auto mb-4 text-red-500" />
                    <h2 className="mb-2 text-2xl font-semibold">Error Loading Company</h2>
                    <p className="mb-6 text-md">{error}</p>
                </div>
            </div>
        );
    }
    
    const addressString = company?.address ? `${company.address.street || ""}, ${company.address.city || ""}, ${company.address.state || ""} ${company.address.postalCode || ""}, ${company.address.country || ""}`.replace(/, ,/g, ",").replace(/^,|,$/g, "").trim() : "Not provided";
    console.log(company)
    return (
        <div className="container px-4 py-8 mx-auto">
            <button onClick={() => navigate("/admin/companies")} className="mb-6 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                <ChevronLeft size={18} className="mr-1" /> Back to Companies
            </button>

            {company && (
                <div className="p-6 mb-8 bg-white rounded-lg shadow-xl">
                    <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
                        <div className="flex items-center">
                            {company.logoUrl ? <img src={company.logoUrl} alt={`${company.name} logo`} className="w-16 h-16 mr-4 rounded-md object-contain border" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/64x64/e2e8f0/94a3b8?text=Logo"; }} /> : <div className="flex items-center justify-center w-16 h-16 mr-4 text-indigo-700 bg-indigo-100 rounded-md"><Building size={32} /></div>}
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">{company.name}</h1>
                                <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${company.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{company.isActive ? "Active" : "Inactive"}</span>
                            </div>
                        </div>
                        <Link to={`/admin/companies/edit/${companyId}`} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"><Edit3 size={18} className="mr-2" /> Edit Company</Link>
                    </div>
                    {company.description && <p className="mb-6 text-gray-600">{company.description}</p>}
                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                        {renderDetailItem(Mail, "Contact Email", company.contactEmail)}
                        {renderDetailItem(Phone, "Contact Phone", company.contactPhone)}
                        {renderDetailItem(Globe, "Website", company.website, true)}
                        {renderDetailItem(MapPin, "Address", addressString)}
                    </div>
                </div>
            )}

            {/* Products Section */}
            <div className="p-6 bg-white rounded-lg shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Products by {company?.name}</h2>
                    <Link to={`/admin/companies/${companyId}/products/add`} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"><PlusCircle size={18} className="mr-2" /> Add New Product</Link>
                </div>

                {isLoadingProducts && <p>Loading products...</p>}
                
                {!isLoadingProducts && productsData.products.length === 0 && (
                    <div className="py-10 text-center text-gray-500"><Package size={48} className="mx-auto mb-2" /><p>No products found for this company.</p></div>
                )}

                {!isLoadingProducts && productsData.products.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Product / Variant</th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Price</th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Stock</th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {productsData.products.map((product) => (
                                    <React.Fragment key={product._id}>
                                        {/* Main Product Row */}
                                        <tr className="bg-gray-50 hover:bg-gray-100">
                                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                                                <div className="flex items-center">
                                                    <button onClick={() => toggleProductExpansion(product._id)} className="mr-2 p-1 rounded-full hover:bg-gray-200">
                                                        {expandedProducts[product._id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    </button>
                                                    {product.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{product.category}</td>
                                            <td colSpan="2"></td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{product.isActive ? "Active" : "Inactive"}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                                <Link to={`/admin/companies/${companyId}/products/edit/${product._id}`} className="p-1 text-blue-600 hover:text-blue-900" title="Edit Product"><Edit3 size={18} /></Link>
                                                <button onClick={() => handleDeleteProductClick(product)} className="p-1 ml-2 text-red-600 hover:text-red-900" title="Delete Product"><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                        {/* Variant Rows */}
                                        {expandedProducts[product._id] && product.variants.map(variant => (
                                            <tr key={variant._id}>
                                                <td className="pl-12 pr-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <ImageWithTooltip src={variant.images && variant.images[0]} alt={variant.name} />
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-800">{variant.name}</div>
                                                            <div className="text-xs text-gray-500">SKU: {variant.sku || 'N/A'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td></td> {/* Empty cell for Category */}
                                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">₹{variant.pricing.ourPrice.toFixed(2)}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{variant.stock}</td>
                                                <td colSpan="2"></td> {/* Empty cells for Status and Actions */}
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Product Confirmation Modal */}
            {showDeleteProductModal && productToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Confirm Product Deletion</h3>
                        <p className="mb-6 text-sm text-gray-600">Are you sure you want to delete the product "<strong>{productToDelete.name}</strong>" from <strong>{company?.name}</strong>? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => { setShowDeleteProductModal(false); setProductToDelete(null); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                            <button onClick={confirmDeleteProduct} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Delete Product</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewCompanyPage;
