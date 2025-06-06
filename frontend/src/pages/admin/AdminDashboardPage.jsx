import React from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Link } from 'react-router-dom';
import { Building, ShoppingBag } from 'lucide-react';

const AdminDashboardPage = () => {
    const { admin } = useAdminAuth();

    if (!admin) {
        return <p>Loading admin data...</p>;
    }

    return (
        <div className="container px-4 py-8 mx-auto">
            <h1 className="mb-6 text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="mb-8 text-lg text-gray-600">
                Welcome back, <span className="font-semibold">{admin.name}</span>!
            </p>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Card for Company Management */}
                <Link to="/admin/companies" className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center mb-4">
                        <Building size={32} className="mr-3 text-indigo-600" />
                        <h2 className="text-xl font-semibold text-gray-700">Manage Companies</h2>
                    </div>
                    <p className="text-gray-600">View, add, and edit company profiles and their products.</p>
                </Link>

                {/* Placeholder Card for Product Management (Overall) */}
                 <Link to="/admin/products" className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center mb-4">
                        <ShoppingBag size={32} className="mr-3 text-green-600" />
                        <h2 className="text-xl font-semibold text-gray-700">Manage Products</h2>
                    </div>
                    <p className="text-gray-600">Oversee all products across all companies.</p>
                </Link> 
                
                {/* Add more cards for other admin functionalities */}
                <div className="p-6 bg-white rounded-lg shadow-lg">
                     <h2 className="text-xl font-semibold text-gray-700">Analytics Overview</h2>
                     <p className="mt-2 text-gray-600">Key metrics and platform performance (coming soon).</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
