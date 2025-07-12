import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import ProductForm from '../../../components/admin/products/ProductForm';
import { getProductInCompany, updateProductInCompany } from '../../../services/companyService';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { AlertTriangle, ChevronLeft } from 'lucide-react';

const EditProductInCompanyPage = () => {
    const { companyId, productId } = useParams();
    const navigate = useNavigate();
    const { token } = useAdminAuth();
    
    const [productData, setProductData] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // For both fetching and submitting
    const [error, setError] = useState(null);

    const fetchProductDetails = useCallback(async () => {
        if (!token || !companyId || !productId) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await getProductInCompany(companyId, productId, token);
            setProductData(data);
        } catch (err) {
            console.error("Failed to fetch product details:", err);
            setError(err.message || "Could not load product details.");
        } finally {
            setIsLoading(false);
        }
    }, [companyId, productId, token]);

    useEffect(() => {
        fetchProductDetails();
    }, [fetchProductDetails]);

    const handleSubmit = async (updatedData) => {
        setIsLoading(true);
        setError(null);
        try {
            await updateProductInCompany(companyId, productId, updatedData, token);
            navigate(`/admin/companies/${companyId}`);
        } catch (err) {
            console.error("Failed to update product:", err);
            setError(err.data?.message || err.message || "An error occurred while updating the product.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !productData) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-700">Loading product details...</p>
            </div>
        );
    }
    
    if (error && !productData) {
        return (
            <div className="p-6 text-center text-red-600 bg-red-100 rounded-md">
                <AlertTriangle size={48} className="mx-auto mb-2 text-red-500" />
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="container px-4 py-8 mx-auto">
            <Link
                to={`/admin/companies/${companyId}`}
                className="inline-flex items-center mb-6 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
                <ChevronLeft size={18} className="mr-1" /> Back to Company Details
            </Link>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Edit Product: {productData?.name || ''}</h1>
            </div>

            {error && (
                <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded-md" role="alert">
                    <strong className="font-bold">Error:</strong> {error}
                </div>
            )}

            {productData ? (
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <ProductForm
                        onSubmit={handleSubmit}
                        initialData={productData}
                        isLoading={isLoading}
                        submitButtonText="Save Changes"
                    />
                </div>
            ) : null}
        </div>
    );
};

export default EditProductInCompanyPage;
