import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { getLeadById, updateLead } from '../../../services/leadService';

const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'closed', label: 'Closed' },
];

const ViewLeadPage = () => {
    const { leadId } = useParams();
    const { token } = useAdminAuth();
    const [lead, setLead] = useState(null);
    const [formData, setFormData] = useState({ status: 'new', notes: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchLead = async () => {
            if (!token) return;
            setLoading(true);
            setError(null);
            try {
                const data = await getLeadById(leadId, token);
                setLead(data);
                setFormData({ status: data.status || 'new', notes: data.notes || '' });
            } catch (err) {
                setError(err.message || 'Failed to load lead.');
            } finally {
                setLoading(false);
            }
        };
        fetchLead();
    }, [leadId, token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess('');
        try {
            const updated = await updateLead(leadId, formData, token);
            setLead(updated);
            setSuccess('Lead updated successfully.');
        } catch (err) {
            setError(err.message || 'Failed to update lead.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <svg className="w-10 h-10 mr-3 -ml-1 text-indigo-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-700">Loading lead...</p>
            </div>
        );
    }

    if (error && !lead) {
        return (
            <div className="p-6 text-center text-red-600 bg-red-100 border border-red-300 rounded-md">
                <p className="text-xl font-semibold">{error}</p>
            </div>
        );
    }

    if (!lead) return null;

    return (
        <div className="max-w-2xl p-6 mx-auto bg-white rounded-lg shadow">
            <h1 className="mb-4 text-2xl font-semibold text-gray-800">Lead Details</h1>

            <div className="mb-4">
                <p><strong>Name:</strong> {lead.fullName}</p>
                <p><strong>Mobile:</strong> {lead.mobileNumber}</p>
                {lead.location && <p><strong>Location:</strong> {lead.location}</p>}
                {lead.requirementDescription && <p><strong>Requirement:</strong> {lead.requirementDescription}</p>}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="status" className="block mb-1 text-sm font-medium text-gray-700">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="notes" className="block mb-1 text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                        id="notes"
                        name="notes"
                        rows="4"
                        value={formData.notes}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    ></textarea>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}
                {success && <p className="text-sm text-green-600">{success}</p>}

                <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

export default ViewLeadPage;

