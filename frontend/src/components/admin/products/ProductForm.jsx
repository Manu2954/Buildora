import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PlusCircle, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { ImageUpload, ImagePreview } from '../ImageUpload';

// --- Reusable Collapsible Section Component ---
const CollapsibleSection = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="border rounded-lg">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full p-4 bg-background hover:bg-border"
            >
                <span className="font-semibold text-text">{title}</span>
                {isOpen ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-screen p-4' : 'max-h-0'}`}>
                {children}
            </div>
        </div>
    );
};


// --- Helper functions ---
const createNewAttribute = () => ({ id: crypto.randomUUID(), name: '', value: '' });

const createNewVariant = () => ({
    id: crypto.randomUUID(),
    name: '',
    sku: '',
    stock: '',
    pricing: { manufacturerPrice: '', mrp: '', ourPrice: '' },
    images: [],
    videos: [],
    dimensions: { length: '', width: '', height: '', unit: 'cm' },
    weight: { value: '', unit: 'kg' },
    attributes: [createNewAttribute()]
});

const initialProductState = {
    name: '',
    description: '',
    category: '',
    isActive: true,
    variants: [createNewVariant()]
};

const ProductForm = ({ onSubmit, initialData = null, isLoading = false, submitButtonText = "Submit" }) => {
    const { companyId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialProductState);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                category: initialData.category || '',
                isActive: initialData.isActive !== undefined ? initialData.isActive : true,
                variants: initialData.variants?.length
                    ? initialData.variants.map(v => ({
                        id: v._id || crypto.randomUUID(),
                        name: v.name || '',
                        sku: v.sku || '',
                        stock: v.stock || '',
                        pricing: v.pricing || { manufacturerPrice: '', mrp: '', ourPrice: '' },
                        images: v.images || [],
                        videos: v.videos || [],
                        dimensions: v.dimensions || { length: '', width: '', height: '', unit: 'cm' },
                        weight: v.weight || { value: '', unit: 'kg' },
                        attributes: Array.isArray(v.attributes) && v.attributes.length
                            ? v.attributes.map((a) => ({ ...a, id: a._id || crypto.randomUUID() }))
                            : [createNewAttribute()]
                    }))
                    : [createNewVariant()],
            });
        }
    }, [initialData]);

    const handleChange = (e, field) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleVariantChange = (variantId, field, value) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map(v => v.id === variantId ? { ...v, [field]: value } : v)
        }));
    };

    const handleNestedVariantChange = (variantId, parentKey, field, value) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map(v => v.id === variantId ? { ...v, [parentKey]: { ...v[parentKey], [field]: value } } : v)
        }));
    };

    const handleAttributeChange = (variantId, attributeId, field, value) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map(variant => {
                if (variant.id === variantId) {
                    return {
                        ...variant,
                        attributes: variant.attributes.map(attr =>
                            attr.id === attributeId ? { ...attr, [field]: value } : attr
                        )
                    };
                }
                return variant;
            })
        }));
    };

    const addAttribute = (variantId) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map(v => v.id === variantId ? { ...v, attributes: [...v.attributes, createNewAttribute()] } : v)
        }));
    };

    const removeAttribute = (variantId, attributeId) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map(v => {
                if (v.id === variantId) {
                    const newAttributes = v.attributes.filter(a => a.id !== attributeId);
                    return { ...v, attributes: newAttributes.length ? newAttributes : [createNewAttribute()] };
                }
                return v;
            })
        }));
    };

    const handleImageUpload = (variantId, url) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map(v => v.id === variantId ? { ...v, images: [...v.images, url] } : v)
        }));
    };

    const handleImageDelete = (variantId, urlToDelete) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map(v => v.id === variantId ? { ...v, images: v.images.filter(url => url !== urlToDelete) } : v)
        }));
    };

    const addVariant = () => {
        setFormData(prev => ({ ...prev, variants: [...prev.variants, createNewVariant()] }));
    };

    const removeVariant = (variantId) => {
        if (formData.variants.length > 1) {
            setFormData(prev => ({ ...prev, variants: prev.variants.filter(v => v.id !== variantId) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSubmit = { ...formData };
        dataToSubmit.variants = dataToSubmit.variants.map(({ id, ...rest }) => ({
            ...rest,
            attributes: rest.attributes.map(({ id, ...attrRest }) => attrRest).filter(a => a.name && a.value)
        })).filter(v => v.name && v.pricing.ourPrice && v.stock);
        
        await onSubmit(dataToSubmit);
    };

    const inputClass = "block w-full px-3 py-2 mt-1 bg-white border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";
    const labelClass = "block text-sm font-medium text-text";

    return (
        <form onSubmit={handleSubmit} className="space-y-8 text-text">
            {/* --- Basic Product Info --- */}
            <fieldset className="p-4 border rounded-lg">
                <legend className="px-2 text-lg font-medium text-text">Basic Product Information</legend>
                <div className="space-y-4">
                    <div><label htmlFor="name" className={labelClass}>Product Name*</label><input type="text" name="name" value={formData.name} onChange={(e) => handleChange(e, 'name')} className={inputClass} required /></div>
                    <div><label htmlFor="description" className={labelClass}>Description*</label><textarea name="description" value={formData.description} onChange={(e) => handleChange(e, 'description')} rows="4" className={inputClass} required></textarea></div>
                    <div><label htmlFor="category" className={labelClass}>Category*</label><input type="text" name="category" value={formData.category} onChange={(e) => handleChange(e, 'category')} className={inputClass} required /></div>
                </div>
            </fieldset>

            {/* --- Variants Section --- */}
            <div className="space-y-6">
                <h2 className="text-lg font-medium text-text">Product Variants</h2>
                {formData.variants.map((variant) => (
                    <div key={variant.id} className="relative p-4 border-2 border-border rounded-lg">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div><label className={labelClass}>Variant Name*</label><input type="text" value={variant.name} onChange={(e) => handleVariantChange(variant.id, 'name', e.target.value)} className={inputClass} placeholder="e.g., 50kg Bag, Red" required /></div>
                            <div><label className={labelClass}>SKU</label><input type="text" value={variant.sku} onChange={(e) => handleVariantChange(variant.id, 'sku', e.target.value)} className={inputClass} /></div>
                            <div><label className={labelClass}>Stock*</label><input type="number" value={variant.stock} onChange={(e) => handleVariantChange(variant.id, 'stock', e.target.value)} className={inputClass} required /></div>
                        </div>

                        <div className="mt-6 space-y-6">
                            <CollapsibleSection title="Pricing">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                    <div><label className={labelClass}>Manufacturer Price (₹)</label><input type="number" value={variant.pricing.manufacturerPrice} onChange={(e) => handleNestedVariantChange(variant.id, 'pricing', 'manufacturerPrice', e.target.value)} className={inputClass} /></div>
                                    <div><label className={labelClass}>MRP (₹)</label><input type="number" value={variant.pricing.mrp} onChange={(e) => handleNestedVariantChange(variant.id, 'pricing', 'mrp', e.target.value)} className={inputClass} /></div>
                                    <div><label className={labelClass}>Our Price (₹)*</label><input type="number" value={variant.pricing.ourPrice} onChange={(e) => handleNestedVariantChange(variant.id, 'pricing', 'ourPrice', e.target.value)} className={inputClass} required /></div>
                                </div>
                            </CollapsibleSection>
                            
                            <CollapsibleSection title="Images & Videos">
                                <div className="flex flex-wrap gap-4">
                                    {variant.images.map((url) => (<ImagePreview key={url} url={url} onDelete={() => handleImageDelete(variant.id, url)} />))}
                                    <ImageUpload 
                                        inputId={`image-upload-${variant.id}`}
                                        variantId={variant.id}
                                        onUploadSuccess={handleImageUpload} 
                                    />
                                </div>
                            </CollapsibleSection>

                            <CollapsibleSection title="Physical Properties">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <h4 className="font-medium">Dimensions</h4>
                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                            <div><label className="text-xs">Length</label><input type="number" value={variant.dimensions.length} onChange={(e) => handleNestedVariantChange(variant.id, 'dimensions', 'length', e.target.value)} className={inputClass} /></div>
                                            <div><label className="text-xs">Width</label><input type="number" value={variant.dimensions.width} onChange={(e) => handleNestedVariantChange(variant.id, 'dimensions', 'width', e.target.value)} className={inputClass} /></div>
                                            <div><label className="text-xs">Height</label><input type="number" value={variant.dimensions.height} onChange={(e) => handleNestedVariantChange(variant.id, 'dimensions', 'height', e.target.value)} className={inputClass} /></div>
                                        </div>
                                        <label className="mt-2 text-xs">Unit</label>
                                        <select value={variant.dimensions.unit} onChange={(e) => handleNestedVariantChange(variant.id, 'dimensions', 'unit', e.target.value)} className={inputClass}><option>mm</option><option>cm</option><option>m</option><option>in</option><option>ft</option></select>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Weight</h4>
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <div><label className="text-xs">Value</label><input type="number" value={variant.weight.value} onChange={(e) => handleNestedVariantChange(variant.id, 'weight', 'value', e.target.value)} className={inputClass} /></div>
                                            <div><label className="text-xs">Unit</label><select value={variant.weight.unit} onChange={(e) => handleNestedVariantChange(variant.id, 'weight', 'unit', e.target.value)} className={inputClass}><option>kg</option><option>g</option><option>lb</option></select></div>
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleSection>

                            <CollapsibleSection title="Custom Attributes">
                                <div className="space-y-3">
                                    {variant.attributes.map(attr => (
                                        <div key={attr.id} className="flex items-center gap-4">
                                            <input type="text" value={attr.name} onChange={(e) => handleAttributeChange(variant.id, attr.id, 'name', e.target.value)} className={inputClass} placeholder="Attribute Name (e.g., Grade)" />
                                            <input type="text" value={attr.value} onChange={(e) => handleAttributeChange(variant.id, attr.id, 'value', e.target.value)} className={inputClass} placeholder="Attribute Value (e.g., 53)" />
                                            <button type="button" onClick={() => removeAttribute(variant.id, attr.id)} className="p-2 text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addAttribute(variant.id)} className="flex items-center px-3 py-1 mt-2 text-sm text-primary border border-primary rounded-md hover:bg-primary/10"><PlusCircle size={16} className="mr-1" /> Add Attribute</button>
                                </div>
                            </CollapsibleSection>
                        </div>
                        {formData.variants.length > 1 && (
                            <button type="button" onClick={() => removeVariant(variant.id)} className="absolute p-1 text-white bg-red-600 rounded-full -top-3 -right-3 hover:bg-red-700"><X size={18} /></button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={addVariant} className="flex items-center px-4 py-2 mt-4 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover"><PlusCircle size={18} className="mr-2" /> Add Another Variant</button>
            </div>
            
            <div className="flex justify-end pt-6 mt-6 border-t">
                <button type="submit" disabled={isLoading} className="px-6 py-2 font-semibold text-white bg-primary rounded-md hover:bg-primary-hover disabled:bg-primary/50">
                    {isLoading ? 'Saving...' : submitButtonText}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
