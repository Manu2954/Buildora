import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PlusCircle, Trash2 } from 'lucide-react';

const initialProductState = {
    name: '',
    description: '',
    sku: '',
    category: '',
    pricing: {
        mrp: '',
        basePrice: '',
        tiers: [],
    },
    stock: {
        quantity: '',
    },
    images: [''],
    attributes: [{ name: '', value: '' }],
    dimensions: {
        length: '',
        width: '',
        height: '',
        unit: 'cm',
    },
    weight: {
        value: '',
        unit: 'kg',
    },
    isActive: true,
};

const ProductForm = ({ onSubmit, initialData = null, isLoading = false, submitButtonText = "Submit" }) => {
    const { companyId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState(initialProductState);
    const [errors, setErrors] = useState({});

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
        setFormData(prev => ({ ...prev, [parentKey]: { ...prev[parentKey], [name]: value } }));
    };

    const handleArrayChange = (e, index, arrayName, fieldName) => {
        const { value } = e.target;
        const list = [...formData[arrayName]];
        list[index][fieldName] = value;
        setFormData(prev => ({ ...prev, [arrayName]: list }));
    };
    
    const handleImageChange = (e, index) => {
        const { value } = e.target;
        const list = [...formData.images];
        list[index] = value;
        setFormData(prev => ({ ...prev, images: list }));
    };

    const addArrayItem = (arrayName, itemStructure) => {
        setFormData(prev => ({ ...prev, [arrayName]: [...prev[arrayName], itemStructure] }));
    };

    const removeArrayItem = (index, arrayName) => {
        const list = [...formData[arrayName]];
        list.splice(index, 1);
        setFormData(prev => ({ ...prev, [arrayName]: list }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Product name is required.';
        if (!formData.description.trim()) newErrors.description = 'Description is required.';
        if (!formData.category.trim()) newErrors.category = 'Category is required.';
        if (!formData.pricing.basePrice || isNaN(formData.pricing.basePrice)) newErrors.basePrice = 'A valid base price is required.';
        if (!formData.stock.quantity || isNaN(formData.stock.quantity)) newErrors.quantity = 'A valid stock quantity is required.';
        
        formData.pricing.tiers.forEach((tier, index) => {
            if (!tier.minQuantity || isNaN(tier.minQuantity)) newErrors[`tier_minq_${index}`] = 'Min Qty must be a number.';
            if (!tier.pricePerUnit || isNaN(tier.pricePerUnit)) newErrors[`tier_ppu_${index}`] = 'Price must be a number.';
        });
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            console.error("Validation failed", errors);
            return;
        }

        // Clean up data before submitting
        const dataToSubmit = {
            ...formData,
            // Filter out empty images and attributes
            images: formData.images.filter(img => img.trim() !== ''),
            attributes: formData.attributes.filter(attr => attr.name.trim() !== '' && attr.value.trim() !== ''),
            // Filter out empty pricing tiers
            pricing: {
                ...formData.pricing,
                tiers: formData.pricing.tiers.filter(tier => tier.minQuantity && tier.pricePerUnit),
            },
            // Convert number fields from string to number
            stock: { quantity: Number(formData.stock.quantity) },
            pricing: {
                 ...formData.pricing,
                 mrp: formData.pricing.mrp ? Number(formData.pricing.mrp) : undefined,
                 basePrice: Number(formData.pricing.basePrice),
                 tiers: formData.pricing.tiers.map(t => ({ minQuantity: Number(t.minQuantity), pricePerUnit: Number(t.pricePerUnit) }))
            }
        };

        // Remove empty optional objects
        if (!dataToSubmit.sku) delete dataToSubmit.sku;
        if (!dataToSubmit.dimensions.length && !dataToSubmit.dimensions.width && !dataToSubmit.dimensions.height) delete dataToSubmit.dimensions;
        if (!dataToSubmit.weight.value) delete dataToSubmit.weight;


        await onSubmit(dataToSubmit);
    };

    const inputClass = "block w-full px-3 py-2 mt-1 placeholder-gray-400 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
    const labelClass = "block text-sm font-medium text-gray-700";
    const errorClass = "mt-1 text-xs text-red-600";
    
    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <fieldset className="p-4 border rounded-md">
                <legend className="px-2 text-lg font-medium text-gray-800">Basic Information</legend>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className={labelClass}>Product Name <span className="text-red-500">*</span></label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} />
                        {errors.name && <p className={errorClass}>{errors.name}</p>}
                    </div>
                     <div>
                        <label htmlFor="description" className={labelClass}>Description <span className="text-red-500">*</span></label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className={inputClass}></textarea>
                        {errors.description && <p className={errorClass}>{errors.description}</p>}
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label htmlFor="sku" className={labelClass}>SKU (Stock Keeping Unit)</label>
                            <input type="text" name="sku" value={formData.sku} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                           <label htmlFor="category" className={labelClass}>Category <span className="text-red-500">*</span></label>
                           <input type="text" name="category" value={formData.category} onChange={handleChange} className={inputClass} />
                           {errors.category && <p className={errorClass}>{errors.category}</p>}
                        </div>
                    </div>
                </div>
            </fieldset>

            {/* Pricing */}
            <fieldset className="p-4 border rounded-md">
                <legend className="px-2 text-lg font-medium text-gray-800">Pricing</legend>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                         <div>
                            <label htmlFor="basePrice" className={labelClass}>Base Price (₹) <span className="text-red-500">*</span></label>
                            <input type="number" name="basePrice" value={formData.pricing.basePrice} onChange={(e) => handleNestedChange(e, 'pricing')} className={inputClass} placeholder="e.g., 420.00" />
                            {errors.basePrice && <p className={errorClass}>{errors.basePrice}</p>}
                        </div>
                        <div>
                            <label htmlFor="mrp" className={labelClass}>MRP (₹)</label>
                            <input type="number" name="mrp" value={formData.pricing.mrp} onChange={(e) => handleNestedChange(e, 'pricing')} className={inputClass} placeholder="e.g., 450.00" />
                        </div>
                    </div>
                    <div>
                        <h4 className="text-md font-medium text-gray-700 mb-2">Pricing Tiers (for bulk discounts)</h4>
                        {formData.pricing.tiers.map((tier, index) => (
                            <div key={index} className="flex items-center gap-4 mb-2 p-2 border rounded-md bg-gray-50">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-600">Minimum Quantity</label>
                                    <input type="number" value={tier.minQuantity} onChange={(e) => handleArrayChange(e, index, 'pricing.tiers', 'minQuantity')} className={inputClass} placeholder="e.g., 50" />
                                     {errors[`tier_minq_${index}`] && <p className={errorClass}>{errors[`tier_minq_${index}`]}</p>}
                                </div>
                                 <div className="flex-1">
                                    <label className="text-xs text-gray-600">Price Per Unit (₹)</label>
                                    <input type="number" value={tier.pricePerUnit} onChange={(e) => handleArrayChange(e, index, 'pricing.tiers', 'pricePerUnit')} className={inputClass} placeholder="e.g., 410.00" />
                                    {errors[`tier_ppu_${index}`] && <p className={errorClass}>{errors[`tier_ppu_${index}`]}</p>}
                                </div>
                                <button type="button" onClick={() => removeArrayItem(index, 'pricing.tiers')} className="p-2 text-red-500 hover:text-red-700 self-end mb-1">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={() => addArrayItem('pricing.tiers', { minQuantity: '', pricePerUnit: '' })} className="flex items-center px-3 py-1 mt-2 text-sm text-indigo-600 border border-indigo-300 rounded-md hover:bg-indigo-50">
                            <PlusCircle size={16} className="mr-1" /> Add Tier
                        </button>
                    </div>
                </div>
            </fieldset>

             {/* Inventory */}
             <fieldset className="p-4 border rounded-md">
                <legend className="px-2 text-lg font-medium text-gray-800">Inventory</legend>
                 <div>
                    <label htmlFor="quantity" className={labelClass}>Stock Quantity <span className="text-red-500">*</span></label>
                    <input type="number" name="quantity" value={formData.stock.quantity} onChange={(e) => handleNestedChange(e, 'stock')} className={inputClass} />
                    {errors.quantity && <p className={errorClass}>{errors.quantity}</p>}
                </div>
            </fieldset>

            {/* Images */}
            <fieldset className="p-4 border rounded-md">
                <legend className="px-2 text-lg font-medium text-gray-800">Images</legend>
                <div className="space-y-3">
                     {formData.images.map((image, index) => (
                        <div key={index} className="flex items-center gap-4">
                            <input type="url" value={image} onChange={(e) => handleImageChange(e, index)} className={inputClass} placeholder="https://example.com/product-image.jpg" />
                            {formData.images.length > 1 && (
                                <button type="button" onClick={() => removeArrayItem(index, 'images')} className="p-2 text-red-500 hover:text-red-700">
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={() => addArrayItem('images', '')} className="flex items-center px-3 py-1 mt-2 text-sm text-indigo-600 border border-indigo-300 rounded-md hover:bg-indigo-50">
                        <PlusCircle size={16} className="mr-1" /> Add Image URL
                    </button>
                </div>
            </fieldset>

             {/* Attributes */}
            <fieldset className="p-4 border rounded-md">
                <legend className="px-2 text-lg font-medium text-gray-800">Custom Attributes</legend>
                <div className="space-y-3">
                    {formData.attributes.map((attr, index) => (
                        <div key={index} className="flex items-center gap-4 p-2 border rounded-md bg-gray-50">
                             <div className="flex-1">
                                <label className="text-xs text-gray-600">Attribute Name</label>
                                <input type="text" value={attr.name} onChange={(e) => handleArrayChange(e, index, 'attributes', 'name')} className={inputClass} placeholder="e.g., Grade" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-600">Attribute Value</label>
                                <input type="text" value={attr.value} onChange={(e) => handleArrayChange(e, index, 'attributes', 'value')} className={inputClass} placeholder="e.g., 53" />
                            </div>
                             <button type="button" onClick={() => removeArrayItem(index, 'attributes')} className="p-2 text-red-500 hover:text-red-700 self-end mb-1">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={() => addArrayItem('attributes', { name: '', value: '' })} className="flex items-center px-3 py-1 mt-2 text-sm text-indigo-600 border border-indigo-300 rounded-md hover:bg-indigo-50">
                        <PlusCircle size={16} className="mr-1" /> Add Attribute
                    </button>
                </div>
            </fieldset>

            {/* Final Controls */}
            <div className="flex items-center">
                <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="isActive" className="block ml-2 text-sm text-gray-900">
                    Product is Active
                </label>
            </div>

            <div className="flex justify-end pt-4 space-x-3 border-t">
                 <button
                    type="button"
                    onClick={() => navigate(`/admin/companies/${companyId}`)} // Go back to company detail page
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
