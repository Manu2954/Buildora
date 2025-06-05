import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyForm from '../../../components/admin/company/CompanyForm';
import { createCompany } from '../../../services/companyService';
import { useAdminAuth } from '../../../context/AdminAuthContext'; // To get the token

const AddCompanyPage = () => {
    const navigate = useNavigate();
    const { token } = useAdminAuth(); // Get admin token from context
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (companyData) => {
        setIsLoading(true);
        setError(null);
        try {
            await createCompany(companyData, token);
            // Optionally, show a success message/toast
            navigate('/admin/companies'); // Redirect to company list page
        } catch (err) {
            console.error("Failed to create company:", err);
            setError(err.data?.message || err.message || "An error occurred while creating the company.");
            // Display error.data.errors if available from express-validator
            if(err.data?.errors) {
                 // You might want a more sophisticated way to display multiple errors
                const messages = Object.values(err.data.errors).map(e => e.msg || e).join(', ');
                setError(`Validation errors: ${messages}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container px-4 py-8 mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Add New Company</h1>
            </div>
            
            {error && (
                <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded-md" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}

            <div className="p-6 bg-white rounded-lg shadow-md">
                <CompanyForm 
                    onSubmit={handleSubmit} 
                    isLoading={isLoading}
                    submitButtonText="Create Company"
                />
            </div>
        </div>
    );
};

export default AddCompanyPage;
