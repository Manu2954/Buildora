import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { getAllCompanies } from '../../../services/companyService'; // To get the list of companies
import { bulkUploadProducts } from '../../../services/adminBulkUploadService';
import { UploadCloud, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

const BulkUploadPage = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadResult, setUploadResult] = useState(null);
    const { token } = useAdminAuth();

    useEffect(() => {
        const fetchCompanies = async () => {
            if (!token) return;
            try {
                const data = await getAllCompanies(token);
                setCompanies(data);
            } catch (err) {
                setError('Failed to fetch companies.');
            }
        };
        fetchCompanies();
    }, [token]);
    
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };
    
    const handleDownloadTemplate = () => {
        // Define CSV headers and an example row
        const headers = "name,description,category,sku,basePrice,mrp,stock,images,variants,attributes";
        const exampleRow = `"Cement Bag","High-quality OPC 53 Grade Cement","Cement","CEM-53",350,380,500,"https://example.com/image1.jpg|https://example.com/image2.jpg","[{""name"":""50kg Bag"",""price"":350,""stock"":500,""sku"":""CEM-53-50KG""}]","[{""name"":""Grade"",""value"":""53""}]"`;
        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + exampleRow;
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "product_upload_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCompany || !selectedFile) {
            setError('Please select a company and a CSV file.');
            return;
        }
        setIsLoading(true);
        setError('');
        setUploadResult(null);

        try {
            const result = await bulkUploadProducts(selectedCompany, selectedFile, token);
            setUploadResult(result);
        } catch (err) {
            setError(err.message || 'An error occurred during upload.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container px-4 py-8 mx-auto">
            <h1 className="mb-6 text-2xl font-semibold text-gray-800">Bulk Product Upload</h1>
            <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white border rounded-lg shadow-sm">
                {/* Step 1: Select Company */}
                <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">1. Select a Company</label>
                    <select id="company" value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} required className="block w-full max-w-md py-2 pl-3 pr-10 mt-1 text-base border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option value="" disabled>-- Choose a company --</option>
                        {companies.map(company => (
                            <option key={company._id} value={company._id}>{company.name}</option>
                        ))}
                    </select>
                </div>

                {/* Step 2: Download Template */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700">2. Download Template</label>
                    <p className="text-xs text-gray-500">Download the CSV template to ensure your data is formatted correctly. Image URLs should be separated by a pipe `|`. Variants and Attributes should be a JSON string.</p>
                     <button type="button" onClick={handleDownloadTemplate} className="inline-flex items-center px-4 py-2 mt-2 text-sm font-medium text-indigo-700 bg-indigo-100 border border-transparent rounded-md hover:bg-indigo-200">
                        <FileText size={16} className="mr-2"/> Download CSV Template
                    </button>
                </div>


                {/* Step 3: Upload File */}
                <div>
                    <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">3. Upload your CSV File</label>
                    <div className="flex justify-center px-6 pt-5 pb-6 mt-1 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <UploadCloud size={48} className="mx-auto text-gray-400"/>
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative font-medium text-indigo-600 bg-white rounded-md cursor-pointer hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                    <span>Upload a file</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".csv" />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">CSV up to 10MB</p>
                        </div>
                    </div>
                     {selectedFile && <p className="mt-2 text-sm text-gray-600">Selected file: {selectedFile.name}</p>}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4 border-t">
                    <button type="submit" disabled={isLoading || !selectedFile || !selectedCompany} className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed">
                        {isLoading ? 'Uploading...' : 'Upload Products'}
                    </button>
                </div>
            </form>

            {/* Upload Results */}
            {uploadResult && (
                <div className="p-6 mt-8 bg-white border rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold">Upload Complete</h3>
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-green-600"><CheckCircle size={20}/> {uploadResult.added} products were successfully added.</div>
                         <div className="flex items-center gap-2 text-red-600"><AlertTriangle size={20}/> {uploadResult.failed} rows had errors.</div>
                         {uploadResult.errors && uploadResult.errors.length > 0 && (
                             <div className="p-3 mt-2 text-sm text-red-700 bg-red-50 rounded-md">
                                 <h4 className="font-semibold">Error Details:</h4>
                                 <ul className="mt-1 list-disc list-inside">
                                     {uploadResult.errors.map((err, index) => <li key={index}>{err}</li>)}
                                 </ul>
                             </div>
                         )}
                    </div>
                </div>
            )}
             {error && <div className="p-3 mt-4 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>}
        </div>
    );
};

export default BulkUploadPage;
