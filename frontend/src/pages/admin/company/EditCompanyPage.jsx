import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CompanyForm from '../../../components/admin/company/CompanyForm';
import { getCompanyById, updateCompany } from '../../../services/companyService';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { AlertTriangle } from 'lucide-react';

const EditCompanyPage = () => {
    const { companyId } = useParams();
    const navigate = useNavigate();
    const { token } = useAdminAuth();
    
    const [companyData, setCompanyData] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // For both fetching and submitting
    const [error, setError] = useState(null);

    const fetchCompanyDetails = useCallback(async () => {
        if (!token || !companyId) {
            setError("Missing token or company ID.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const data = await getCompanyById(companyId, token);
            setCompanyData(data);
        } catch (err) {
            console.error("Failed to fetch company details:", err);
            setError(err.message || "Could not load company details.");
            if (err.status === 404) {
                 setError(`Company with ID ${companyId} not found.`);
            }
        } finally {
            setIsLoading(false);
        }
    }, [companyId, token]);

    useEffect(() => {
        fetchCompanyDetails();
    }, [fetchCompanyDetails]);

    const handleSubmit = async (updatedData) => {
        setIsLoading(true);
        setError(null);
        try {
            await updateCompany(companyId, updatedData, token);
            // Optionally, show a success message/toast
            navigate('/admin/companies'); // Redirect to company list
        } catch (err) {
            console.error("Failed to update company:", err);
            setError(err.data?.message || err.message || "An error occurred while updating the company.");
            if(err.data?.errors) {
                const messages = Object.values(err.data.errors).map(e => e.msg || e).join(', ');
                setError(`Validation errors: ${messages}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !companyData) { // Show loading spinner only during initial data fetch
        return (
            <div className="flex items-center justify-center h-64">
                <svg className="w-10 h-10 mr-3 -ml-1 text-indigo-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-700">Loading company details...</p>
            </div>
        );
    }
    
    // Display error more prominently if data couldn't be fetched
    if (error && !companyData) {
        return (
            <div className="container px-4 py-8 mx-auto">
                 <button
                    onClick={() => navigate('/admin/companies')}
                    className="mb-4 inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    &larr; Back to Companies
                </button>
                <div className="p-6 text-center text-red-600 bg-red-100 border border-red-300 rounded-md">
                    <AlertTriangle size={48} className="mx-auto mb-2 text-red-500" />
                    <p className="text-xl font-semibold">Error Loading Company</p>
                    <p>{error}</p>
                     <button 
                        onClick={fetchCompanyDetails}
                        className="px-4 py-2 mt-4 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="container px-4 py-8 mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Edit Company: {companyData?.name || 'Loading...'}</h1>
            </div>

            {error && ( // For submission errors
                <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded-md" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}

            {companyData ? (
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <CompanyForm
                        onSubmit={handleSubmit}
                        initialData={companyData}
                        isLoading={isLoading} // Reflects submission loading state
                        submitButtonText="Save Changes"
                    />
                </div>
            ) : (
                // This state should ideally be covered by the loading/error states above
                !isLoading && <p className="text-gray-600">Company data could not be loaded.</p>
            )}
        </div>
    );
};

export default EditCompanyPage;
