import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Edit, Trash2, AlertTriangle } from 'lucide-react';
const ProductFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        sku: '',
        category: '',
        pricing: { basePrice: 0, mrp: 0 },
        stock: { quantity: 0 },
        images: [],
        attributes: [],
        isActive: true,
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (initialData) {
            // Deep copy to avoid mutating initialData
            const data = JSON.parse(JSON.stringify(initialData));
            // Ensure nested objects exist
            data.pricing = data.pricing || { basePrice: 0, mrp: 0 };
            data.stock = data.stock || { quantity: 0 };
            setFormData(data);
        } else {
            // Reset form for new product
            setFormData({
                name: '', description: '', sku: '', category: '',
                pricing: { basePrice: 0, mrp: 0 },
                stock: { quantity: 0 },
                images: [], attributes: [], isActive: true,
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleNestedChange = (e) => {
        const { name, value } = e.target;
        const [parent, child] = name.split('.');
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [child]: parseFloat(value) || 0 }
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        const result = await onSubmit(formData);
        setSubmitting(false);
        if (!result.success) {
            setError(result.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-8 m-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">{initialData ? 'Edit Product' : 'Add New Product'}</h2>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                            <input type="text" name="category" id="category" value={formData.category} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea name="description" id="description" rows="3" value={formData.description} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="sku" className="block text-sm font-medium text-gray-700">SKU (Optional)</label>
                            <input type="text" name="sku" id="sku" value={formData.sku} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                        </div>
                        <div>
                            <label htmlFor="stock.quantity" className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                            <input type="number" name="stock.quantity" id="stock.quantity" value={formData.stock.quantity} onChange={handleNestedChange} required min="0" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="pricing.basePrice" className="block text-sm font-medium text-gray-700">Base Price (₹)</label>
                            <input type="number" name="pricing.basePrice" id="pricing.basePrice" value={formData.pricing.basePrice} onChange={handleNestedChange} required min="0" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                        </div>
                        <div>
                            <label htmlFor="pricing.mrp" className="block text-sm font-medium text-gray-700">MRP (₹, Optional)</label>
                            <input type="number" name="pricing.mrp" id="pricing.mrp" value={formData.pricing.mrp} onChange={handleNestedChange} min="0" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                        </div>
                    </div>
                    
                    <div className="flex items-center">
                        <input id="isActive" name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"/>
                        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Product is Active</label>
                    </div>

                    <div className="flex justify-end pt-4 space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-300">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 disabled:bg-indigo-300">
                            {submitting ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;