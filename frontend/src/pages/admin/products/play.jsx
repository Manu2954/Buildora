// src/components/admin/products/ProductForm.jsx
// THIS IS AN UPDATED VERSION of your ProductForm.jsx with image previews.

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PlusCircle, Trash2, Image as ImageIcon } from 'lucide-react';

const initialProductState = {
    // ... (same as your initialProductState)
    name: '',
    description: '',
    sku: '',
    category: '',
    pricing: { mrp: '', basePrice: '', tiers: [] },
    stock: { quantity: '' },
    images: [''],
    attributes: [{ name: '', value: '' }],
    dimensions: { length: '', width: '', height: '', unit: 'cm' },
    weight: { value: '', unit: 'kg' },
    isActive: true,
};

const ProductForm = ({ onSubmit, initialData = null, isLoading = false, submitButtonText = "Submit" }) => {
    const { companyId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState(initialProductState);
    const [errors, setErrors] = useState({});

    // ... (useEffect and all handler functions are the same as in your provided file)
    // No changes needed for handleChange, handleNestedChange, etc.
    useEffect(() => {
        if (initialData) {
            // Deep merge to ensure all fields from initialProductState are present
            setFormData(current => ({
                ...initialProductState,
                ...initialData,
                pricing: { ...initialProductState.pricing, ...(initialData.pricing || {}) },
                stock: { ...initialProductState.stock, ...(initialData.stock || {}) },
                dimensions: { ...initialProductState.dimensions, ...(initialData.dimensions || {}) },
                weight: { ...initialProductState.weight, ...(initialData.weight || {}) },
                images: initialData.images?.length ? initialData.images : [''],
                attributes: initialData.attributes?.length ? initialData.attributes : [{ name: '', value: '' }],
            }));
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleNestedChange = (e, parentKey) => {
        const { name, value } = e.target;
        const nestedObject = parentKey.split('.').reduce((o, k) => o[k], formData);
        setFormData(prev => ({ ...prev, [parentKey]: { ...prev[parentKey], [name]: value } }));
    };
    
    const handleArrayChange = (e, index, arrayName, fieldName) => {
        const { value } = e.target;
        const list = [...formData[arrayName]];
        list[index][fieldName] = value;
        setFormData(prev => ({ ...prev, [arrayName]: list }));
    };

    const handlePricingTierChange = (e, index, fieldName) => {
        const { value } = e.target;
        const tiers = [...formData.pricing.tiers];
        tiers[index][fieldName] = value;
        setFormData(prev => ({ ...prev, pricing: { ...prev.pricing, tiers } }));
    };
    
    const handleImageChange = (e, index) => {
        const { value } = e.target;
        const list = [...formData.images];
        list[index] = value;
        setFormData(prev => ({ ...prev, images: list }));
    };

    const addArrayItem = (arrayName, itemStructure) => {
        if (arrayName === 'pricing.tiers') {
            setFormData(prev => ({ ...prev, pricing: { ...prev.pricing, tiers: [...prev.pricing.tiers, itemStructure] }}));
        } else {
            setFormData(prev => ({ ...prev, [arrayName]: [...prev[arrayName], itemStructure] }));
        }
    };

    const removeArrayItem = (index, arrayName) => {
        if (arrayName === 'pricing.tiers') {
            const tiers = [...formData.pricing.tiers];
            tiers.splice(index, 1);
            setFormData(prev => ({ ...prev, pricing: { ...prev.pricing, tiers }}));
        } else {
            const list = [...formData[arrayName]];
            list.splice(index, 1);
            setFormData(prev => ({ ...prev, [arrayName]: list }));
        }
    };

    // ... (validateForm and handleSubmit logic is the same)
    const handleSubmit = async (e) => {
        e.preventDefault();
        // ... validation logic ...

        // Clean up data before submitting
        const dataToSubmit = {
            ...formData,
            images: formData.images.filter(img => img && img.trim() !== ''),
            attributes: formData.attributes.filter(attr => attr.name && attr.name.trim() !== '' && attr.value && attr.value.trim() !== ''),
            pricing: {
                ...formData.pricing,
                mrp: formData.pricing.mrp ? Number(formData.pricing.mrp) : undefined,
                basePrice: Number(formData.pricing.basePrice),
                tiers: formData.pricing.tiers
                    .filter(tier => tier.minQuantity && tier.pricePerUnit)
                    .map(t => ({ minQuantity: Number(t.minQuantity), pricePerUnit: Number(t.pricePerUnit) }))
            },
            stock: { quantity: Number(formData.stock.quantity) },
        };
        
        await onSubmit(dataToSubmit);
    };


    const inputClass = "block w-full px-3 py-2 mt-1 placeholder-gray-400 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
    const labelClass = "block text-sm font-medium text-gray-700";
    
    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* ... Other form sections (Basic Info, Pricing, etc.) are the same ... */}

            {/* Images Section with Preview */}
            <fieldset className="p-4 border rounded-md">
                <legend className="px-2 text-lg font-medium text-gray-800">Images</legend>
                <p className="text-sm text-gray-500 mb-4">Add public image URLs. The first valid URL will be the primary image.</p>
                <div className="space-y-4">
                     {formData.images.map((image, index) => (
                        <div key={index} className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center border">
                                {image ? (
                                    <img 
                                        src={image} 
                                        alt={`Product preview ${index + 1}`} 
                                        className="object-contain w-full h-full rounded-md"
                                        onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}
                                    />
                                ) : null}
                                <div style={{display: image ? 'none' : 'flex' }} className="items-center justify-center w-full h-full">
                                    <ImageIcon size={32} className="text-gray-400" />
                                </div>
                            </div>
                            <div className="flex-grow">
                                <label className="text-xs text-gray-600">Image URL {index + 1}</label>
                                <div className="flex gap-2">
                                    <input type="url" value={image} onChange={(e) => handleImageChange(e, index)} className={inputClass} placeholder="https://example.com/image.jpg" />
                                    {formData.images.length > 1 && (
                                        <button type="button" onClick={() => removeArrayItem(index, 'images')} className="p-2 text-red-500 hover:text-red-700 self-center">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={() => addArrayItem('images', '')} className="flex items-center px-3 py-1 mt-2 text-sm text-indigo-600 border border-indigo-300 rounded-md hover:bg-indigo-50">
                        <PlusCircle size={16} className="mr-1" /> Add Image URL
                    </button>
                </div>
            </fieldset>

            {/* ... Other form sections (Attributes, etc.) and submit buttons are the same ... */}
            <div className="flex justify-end pt-4 space-x-3 border-t">
                 <button
                    type="button"
                    onClick={() => navigate(`/admin/companies/${companyId}`)}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-md shadow-sm hover:bg-gray-300 focus:outline-none"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-300"
                >
                    {isLoading ? 'Saving...' : submitButtonText}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;