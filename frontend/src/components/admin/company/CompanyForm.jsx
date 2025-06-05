import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CompanyForm = ({ onSubmit, initialData = null, isLoading = false, submitButtonText = "Submit" }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        logoUrl: '',
        address: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'India', // Default country
        },
        contactEmail: '',
        contactPhone: '',
        website: '',
        isActive: true,
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                logoUrl: initialData.logoUrl || '',
                address: {
                    street: initialData.address?.street || '',
                    city: initialData.address?.city || '',
                    state: initialData.address?.state || '',
                    postalCode: initialData.address?.postalCode || '',
                    country: initialData.address?.country || 'India',
                },
                contactEmail: initialData.contactEmail || '',
                contactPhone: initialData.contactPhone || '',
                website: initialData.website || '',
                isActive: initialData.isActive !== undefined ? initialData.isActive : true,
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [name]: value,
            },
        }));
         if (errors[`address.${name}`]) {
            setErrors(prev => ({ ...prev, [`address.${name}`]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Company name is required.';
        if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
            newErrors.contactEmail = 'Invalid email format.';
        }
        // Add more validations as needed based on API requirements (e.g., phone format, URL format)
        if (formData.website && !/^(ftp|http|https):\/\/[^ "]+$/.test(formData.website)) {
             newErrors.website = 'Invalid URL format (e.g., https://example.com).';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        // Prepare data for API: remove empty optional fields if necessary, or ensure they are empty strings
        const dataToSubmit = { ...formData };
        if (!dataToSubmit.description) delete dataToSubmit.description;
        if (!dataToSubmit.logoUrl) delete dataToSubmit.logoUrl;
        if (!dataToSubmit.contactEmail) delete dataToSubmit.contactEmail;
        if (!dataToSubmit.contactPhone) delete dataToSubmit.contactPhone;
        if (!dataToSubmit.website) delete dataToSubmit.website;
        
        // Ensure address fields are present even if empty, or handle as per API spec
        if (Object.values(dataToSubmit.address).every(val => val === '')) {
            delete dataToSubmit.address; // Or send empty object if API expects it
        }

        try {
            await onSubmit(dataToSubmit);
            // On successful submission, navigation or success message handled by parent component
        } catch (error) {
            // Error handling (e.g., displaying API errors) handled by parent component
            console.error("Submission error in CompanyForm:", error);
            // Potentially set form-level error here if not handled by parent
        }
    };

    const inputClass = "block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
    const labelClass = "block text-sm font-medium text-gray-700";
    const errorClass = "mt-1 text-xs text-red-600";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name */}
            <div>
                <label htmlFor="name" className={labelClass}>Company Name <span className="text-red-500">*</span></label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={inputClass} required />
                {errors.name && <p className={errorClass}>{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" className={labelClass}>Description</label>
                <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="3" className={inputClass}></textarea>
            </div>

            {/* Logo URL */}
            <div>
                <label htmlFor="logoUrl" className={labelClass}>Logo URL</label>
                <input type="url" name="logoUrl" id="logoUrl" value={formData.logoUrl} onChange={handleChange} className={inputClass} placeholder="https://example.com/logo.png" />
            </div>

            {/* Contact Email */}
            <div>
                <label htmlFor="contactEmail" className={labelClass}>Contact Email</label>
                <input type="email" name="contactEmail" id="contactEmail" value={formData.contactEmail} onChange={handleChange} className={inputClass} />
                {errors.contactEmail && <p className={errorClass}>{errors.contactEmail}</p>}
            </div>

            {/* Contact Phone */}
            <div>
                <label htmlFor="contactPhone" className={labelClass}>Contact Phone</label>
                <input type="tel" name="contactPhone" id="contactPhone" value={formData.contactPhone} onChange={handleChange} className={inputClass} />
            </div>

            {/* Website */}
            <div>
                <label htmlFor="website" className={labelClass}>Website URL</label>
                <input type="url" name="website" id="website" value={formData.website} onChange={handleChange} className={inputClass} placeholder="https://example.com" />
                 {errors.website && <p className={errorClass}>{errors.website}</p>}
            </div>

            {/* Address Fields */}
            <fieldset className="p-4 border rounded-md">
                <legend className="px-2 text-sm font-medium text-gray-700">Address</legend>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label htmlFor="street" className={labelClass}>Street</label>
                        <input type="text" name="street" id="street" value={formData.address.street} onChange={handleAddressChange} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="city" className={labelClass}>City</label>
                        <input type="text" name="city" id="city" value={formData.address.city} onChange={handleAddressChange} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="state" className={labelClass}>State</label>
                        <input type="text" name="state" id="state" value={formData.address.state} onChange={handleAddressChange} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="postalCode" className={labelClass}>Postal Code</label>
                        <input type="text" name="postalCode" id="postalCode" value={formData.address.postalCode} onChange={handleAddressChange} className={inputClass} />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="country" className={labelClass}>Country</label>
                        <input type="text" name="country" id="country" value={formData.address.country} onChange={handleAddressChange} className={inputClass} />
                    </div>
                </div>
            </fieldset>

            {/* Is Active */}
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
                    Company is Active
                </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
                 <button
                    type="button"
                    onClick={() => navigate(-1)} // Go back to previous page
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                >
                    {isLoading ? 'Saving...' : submitButtonText}
                </button>
            </div>
        </form>
    );
};

export default CompanyForm;
