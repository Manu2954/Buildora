import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import ProductForm from '../../../components/admin/products/ProductForm';
import { addProductToCompany } from '../../../services/companyService';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { ChevronLeft } from 'lucide-react';

const AddProductToCompanyPage = () => {
    const { companyId } = useParams();
    const navigate = useNavigate();
    const { token } = useAdminAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (productData) => {
        setIsLoading(true);
        setError(null);
        try {
            await addProductToCompany(companyId, productData, token);
            // Optionally, show a success message/toast
            navigate(`/admin/companies/${companyId}`); // Redirect to company detail page
        } catch (err) {
            console.error("Failed to create product:", err);
            setError(err.data?.message || err.message || "An error occurred while creating the product.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container px-4 py-8 mx-auto">
             <Link
                to={`/admin/companies/${companyId}`}
                className="inline-flex items-center mb-6 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
                <ChevronLeft size={18} className="mr-1" /> Back to Company Details
            </Link>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Add New Product</h1>
            </div>
            
            {error && (
                <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded-md" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}

            <div className="p-6 bg-white rounded-lg shadow-md">
                <ProductForm 
                    onSubmit={handleSubmit} 
                    isLoading={isLoading}
                    submitButtonText="Create Product"
                />
            </div>
        </div>
    );
};

export default AddProductToCompanyPage;
