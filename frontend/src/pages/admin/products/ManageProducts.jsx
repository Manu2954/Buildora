import ProductList from '../../../components/admin/products/ProductsList';
import ProductFormModal from '../../../components/admin/products/ProductForm';
import DeleteConfirmationModal from '../../../components/admin/products/DeleteConfirmationModal';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Edit, Trash2, AlertTriangle } from 'lucide-react';
// A mock function to get the auth token. Replace with your actual auth context/logic.
// const token = () => `Bearer ${localStorage.getItem('adminToken')}`;

const ManageProductsPage = () => {
    const { token } = useAdminAuth();
    
    const { companyId } = useParams();
    const navigate = useNavigate();
    
    const [products, setProducts] = useState([]);
    const [companyName, setCompanyName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null); // For editing
    const [productToDelete, setProductToDelete] = useState(null); // For deleting

    const API_BASE_URL = 'http://localhost:5000/api/admin'; // Adjust if your base URL is different

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/companies/${companyId}/products`, {
                headers: { 'Authorization': `Bearer ${token}`}
            });
            setProducts(response.data.products);
            setCompanyName(response.data.companyName);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch products.');
            console.error("Fetch products error:", err);
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleAddNewProduct = () => {
        setSelectedProduct(null);
        setIsFormModalOpen(true);
    };

    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setIsFormModalOpen(true);
    };

    const handleDeleteProduct = (product) => {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
    };

    const handleFormSubmit = async (productData) => {
        const url = selectedProduct 
            ? `${API_BASE_URL}/companies/${companyId}/products/${selectedProduct._id}`
            : `${API_BASE_URL}/companies/${companyId}/products`;

        const method = selectedProduct ? 'put' : 'post';

        try {
            const response = await axios[method](url, productData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (selectedProduct) {
                // Update product in the list
                setProducts(products.map(p => p._id === selectedProduct._id ? response.data : p));
            } else {
                // Add new product to the list
                setProducts([...products, response.data]);
            }
            setIsFormModalOpen(false);
            return { success: true };
        } catch (err) {
            console.error("Product form submission error:", err);
            return { success: false, message: err.response?.data?.message || 'An error occurred.' };
        }
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        try {
            await axios.delete(`${API_BASE_URL}/companies/${companyId}/products/${productToDelete._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setProducts(products.filter(p => p._id !== productToDelete._id));
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete product.');
            console.error("Delete product error:", err);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><p>Loading products...</p></div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <button onClick={() => navigate(-1)} className="mb-4 text-indigo-600 hover:text-indigo-800 transition duration-150 ease-in-out">&larr; Back to Company</button>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
                    <p className="text-lg text-gray-600">Company: {companyName}</p>
                </div>
                <button
                    onClick={handleAddNewProduct}
                    className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition duration-300"
                >
                    + Add New Product
                </button>
            </div>
            
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

            <ProductList
                products={products}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
            />

            {isFormModalOpen && (
                <ProductFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    initialData={selectedProduct}
                />
            )}

            {isDeleteModalOpen && (
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    productName={productToDelete?.name}
                />
            )}
        </div>
    );
};

export default ManageProductsPage;
