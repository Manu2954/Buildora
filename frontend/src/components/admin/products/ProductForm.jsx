import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PlusCircle, Trash2 } from 'lucide-react';

// Each variant now gets a temporary unique ID for stable keys in React
const createNewVariant = () => ({ id: crypto.randomUUID(), name: '', price: '', stock: '', sku: '', unit: '' });
const createNewAttribute = () => ({ id: crypto.randomUUID(), name: '', value: '' });

const initialProductState = {
    name: '', description: '', sku: '', category: '',
    pricing: { mrp: '', basePrice: '' },
    stock: { quantity: '' },
    images: [''],
    attributes: [createNewAttribute()],
    variants: [createNewVariant()],
    dimensions: { length: '', width: '', height: '', unit: 'cm' },
    weight: { value: '', unit: 'kg' },
    isActive: true,
};


const ProductForm = ({ onSubmit, initialData = null, isLoading = false, submitButtonText = "Submit" }) => {
    const { companyId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialProductState);

    useEffect(() => {
        if (initialData) {
            setFormData(current => ({
                ...initialProductState, ...initialData,
                pricing: { ...initialProductState.pricing, ...(initialData.pricing || {}) },
                stock: { ...initialProductState.stock, ...(initialData.stock || {}) },
                dimensions: { ...initialProductState.dimensions, ...(initialData.dimensions || {}) },
                weight: { ...initialProductState.weight, ...(initialData.weight || {}) },
                images: initialData.images?.length ? initialData.images : [''],
                attributes: initialData.attributes?.length ? initialData.attributes.map(a => ({...a, id: a._id || crypto.randomUUID()})) : [createNewAttribute()],
                variants: initialData.variants?.length ? initialData.variants.map(v => ({...v, id: v._id || crypto.randomUUID()})) : [createNewVariant()],
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

    const handleArrayChange = (e, itemId, arrayName, fieldName = null) => {
        const { value } = e.target;
        const list = formData[arrayName].map(item => {
            if (item.id === itemId) {
                if (fieldName) {
                    return { ...item, [fieldName]: value };
                }
                // This part is for simple string arrays like 'images'
                const itemToUpdate = { ...item };
                itemToUpdate.value = value; // A bit of a hack for images, might need refactor if more simple arrays are added
                return value; 
            }
            return item;
        });
        setFormData(prev => ({ ...prev, [arrayName]: list }));
    };

    const addArrayItem = (arrayName, itemStructure) => {
        setFormData(prev => ({ ...prev, [arrayName]: [...prev[arrayName], itemStructure] }));
    };

    const removeArrayItem = (itemId, arrayName) => {
        const list = formData[arrayName].filter(item => item.id !== itemId);
        if (list.length === 0) {
            if (arrayName === 'variants') list.push(createNewVariant());
            if (arrayName === 'attributes') list.push(createNewAttribute());
            // For images, it's okay to have an empty array, so we don't add a blank one back
        }
        setFormData(prev => ({ ...prev, [arrayName]: list }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSubmit = { ...formData };
        dataToSubmit.variants = dataToSubmit.variants.map(({ id, ...rest }) => rest).filter(v => v.name && v.price && v.stock);
        dataToSubmit.attributes = dataToSubmit.attributes.map(({ id, ...rest }) => rest).filter(a => a.name && a.value);
        dataToSubmit.images = dataToSubmit.images.filter(img => img && img.trim() !== '');

        await onSubmit(dataToSubmit);
    };
    
    const inputClass = "block w-full px-3 py-2 mt-1 placeholder-gray-400 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
    const labelClass = "block text-sm font-medium text-gray-700";
    
    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* --- Basic Info --- */}
            <fieldset className="p-4 border rounded-md">
                <legend className="px-2 text-lg font-medium text-gray-800">Basic Information</legend>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className={labelClass}>Product Name*</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={inputClass} required />
                    </div>
                     <div>
                        <label htmlFor="description" className={labelClass}>Description*</label>
                        <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="4" className={inputClass} required></textarea>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label htmlFor="sku" className={labelClass}>Base SKU (Optional)</label>
                            <input type="text" name="sku" id="sku" value={formData.sku} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                           <label htmlFor="category" className={labelClass}>Category*</label>
                           <input type="text" name="category" id="category" value={formData.category} onChange={handleChange} className={inputClass} required />
                        </div>
                    </div>
                </div>
            </fieldset>

            {/* --- Default Pricing & Stock --- */}
             <fieldset className="p-4 border rounded-md">
                 <legend className="px-2 text-lg font-medium text-gray-800">Default Pricing & Stock</legend>
                <p className="mb-4 text-sm text-gray-600">This is used if no specific variants are added. It will be overridden by variants.</p>
                 <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                     <div>
                        <label htmlFor="basePrice" className={labelClass}>Base Price (₹)*</label>
                        <input type="number" name="basePrice" value={formData.pricing.basePrice} onChange={(e) => handleNestedChange(e, 'pricing')} className={inputClass} required/>
                    </div>
                    <div>
                        <label htmlFor="mrp" className={labelClass}>MRP (₹)</label>
                        <input type="number" name="mrp" value={formData.pricing.mrp} onChange={(e) => handleNestedChange(e, 'pricing')} className={inputClass} />
                    </div>
                     <div>
                        <label htmlFor="quantity" className={labelClass}>Default Stock*</label>
                        <input type="number" name="quantity" value={formData.stock.quantity} onChange={(e) => handleNestedChange(e, 'stock')} className={inputClass} required/>
                    </div>
                </div>
            </fieldset>

            {/* --- Variants --- */}
            <fieldset className="p-4 border rounded-md">
                <legend className="px-2 text-lg font-medium text-gray-800">Product Variants</legend>
                <div className="space-y-4">
                     {formData.variants.map((variant) => (
                        <div key={variant.id} className="relative p-4 border rounded-lg bg-gray-50">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                                <div><label className="text-xs font-medium text-gray-600">Variant Name*</label><input type="text" name="name" value={variant.name} onChange={(e) => handleArrayChange(e, variant.id, 'variants', 'name')} className={inputClass} required/></div>
                                <div><label className="text-xs font-medium text-gray-600">Price (₹)*</label><input type="number" name="price" value={variant.price} onChange={(e) => handleArrayChange(e, variant.id, 'variants', 'price')} className={inputClass} required/></div>
                                <div><label className="text-xs font-medium text-gray-600">Stock*</label><input type="number" name="stock" value={variant.stock} onChange={(e) => handleArrayChange(e, variant.id, 'variants', 'stock')} className={inputClass} required/></div>
                                <div><label className="text-xs font-medium text-gray-600">Unit</label><input type="text" name="unit" value={variant.unit} onChange={(e) => handleArrayChange(e, variant.id, 'variants', 'unit')} className={inputClass}/></div>
                                <div><label className="text-xs font-medium text-gray-600">SKU</label><input type="text" name="sku" value={variant.sku} onChange={(e) => handleArrayChange(e, variant.id, 'variants', 'sku')} className={inputClass}/></div>
                            </div>
                            {formData.variants.length > 1 && (
                                <button type="button" onClick={() => removeArrayItem(variant.id, 'variants')} className="absolute p-1 text-red-500 bg-white rounded-full -top-3 -right-3 hover:text-red-700 hover:bg-red-100"><Trash2 size={18} /></button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={() => addArrayItem('variants', createNewVariant())} className="flex items-center px-3 py-1 mt-4 text-sm text-indigo-600 border border-indigo-300 rounded-md hover:bg-indigo-50"><PlusCircle size={16} className="mr-1" /> Add Variant</button>
                </div>
            </fieldset>
            
            {/* --- Images --- */}
            <fieldset className="p-4 border rounded-md">
                <legend className="px-2 text-lg font-medium text-gray-800">Images</legend>
                <div className="space-y-3">
                     {formData.images.map((image, index) => (
                        <div key={index} className="flex items-center gap-4">
                            <input type="url" value={image} onChange={(e) => handleArrayChange(e, index, 'images')} className={inputClass} placeholder="https://example.com/image.jpg" />
                            {formData.images.length > 1 && (
                                <button type="button" onClick={() => removeArrayItem(index, 'images')} className="p-2 text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={() => addArrayItem('images', '')} className="flex items-center px-3 py-1 mt-2 text-sm text-indigo-600 border border-indigo-300 rounded-md hover:bg-indigo-50"><PlusCircle size={16} className="mr-1" /> Add Image URL</button>
                </div>
            </fieldset>

            {/* --- Attributes --- */}
            <fieldset className="p-4 border rounded-md">
                <legend className="px-2 text-lg font-medium text-gray-800">Custom Attributes</legend>
                 <div className="space-y-3">
                    {formData.attributes.map((attr) => (
                        <div key={attr.id} className="flex items-center gap-4">
                            <input type="text" value={attr.name} onChange={(e) => handleArrayChange(e, attr.id, 'attributes', 'name')} className={inputClass} placeholder="Attribute Name (e.g., Grade)" />
                            <input type="text" value={attr.value} onChange={(e) => handleArrayChange(e, attr.id, 'attributes', 'value')} className={inputClass} placeholder="Attribute Value (e.g., 53)" />
                            {formData.attributes.length > 1 && (
                                <button type="button" onClick={() => removeArrayItem(attr.id, 'attributes')} className="p-2 text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={() => addArrayItem('attributes', createNewAttribute())} className="flex items-center px-3 py-1 mt-2 text-sm text-indigo-600 border border-indigo-300 rounded-md hover:bg-indigo-50"><PlusCircle size={16} className="mr-1" /> Add Attribute</button>
                </div>
            </fieldset>
            
            {/* --- Physical Properties --- */}
            <fieldset className="p-4 border rounded-md">
                <legend className="px-2 text-lg font-medium text-gray-800">Physical Properties</legend>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <h4 className="text-base font-medium text-gray-700">Dimensions</h4>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                             <div><label className="text-xs">Length</label><input type="number" name="length" value={formData.dimensions.length} onChange={(e) => handleNestedChange(e, 'dimensions')} className={inputClass}/></div>
                            <div><label className="text-xs">Width</label><input type="number" name="width" value={formData.dimensions.width} onChange={(e) => handleNestedChange(e, 'dimensions')} className={inputClass}/></div>
                            <div><label className="text-xs">Height</label><input type="number" name="height" value={formData.dimensions.height} onChange={(e) => handleNestedChange(e, 'dimensions')} className={inputClass}/></div>
                        </div>
                         <label className="mt-2 text-xs">Unit</label>
                        <select name="unit" value={formData.dimensions.unit} onChange={(e) => handleNestedChange(e, 'dimensions')} className={inputClass}><option value="cm">cm</option><option value="m">m</option><option value="in">in</option><option value="ft">ft</option></select>
                    </div>
                    <div>
                        <h4 className="text-base font-medium text-gray-700">Weight</h4>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <div><label className="text-xs">Value</label><input type="number" name="value" value={formData.weight.value} onChange={(e) => handleNestedChange(e, 'weight')} className={inputClass}/></div>
                            <div><label className="text-xs">Unit</label><select name="unit" value={formData.weight.unit} onChange={(e) => handleNestedChange(e, 'weight')} className={inputClass}><option value="kg">kg</option><option value="g">g</option><option value="lb">lb</option></select></div>
                        </div>
                    </div>
                </div>
            </fieldset>

            {/* --- Final Controls --- */}
            <div className="flex items-center">
                <input id="isActive" name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                <label htmlFor="isActive" className="block ml-2 text-sm text-gray-900">Product is Active</label>
            </div>
            
            <div className="flex justify-end pt-4 space-x-3 border-t">
                 <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-md shadow-sm hover:bg-gray-300 focus:outline-none">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-300">{isLoading ? 'Saving...' : submitButtonText}</button>
            </div>
        </form>
    );
};

export default ProductForm;
