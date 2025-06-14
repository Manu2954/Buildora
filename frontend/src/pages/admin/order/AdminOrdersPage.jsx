import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { getAllOrders } from '../../../services/adminOrderService';
import { Eye, Search, AlertTriangle, Filter } from 'lucide-react';

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ search: '', status: '' });
    const { token } = useAdminAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            if (!token) return;
            try {
                const data = await getAllOrders(token);
                setOrders(data);
                setFilteredOrders(data);
            } catch (err) {
                setError(err.message || 'Failed to fetch orders.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, [token]);
    
    // Apply filters whenever the filters state or the main orders list changes
    useEffect(() => {
        let result = orders;
        if (filters.status) {
            result = result.filter(order => order.orderStatus === filters.status);
        }
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            result = result.filter(order => 
                order._id.toLowerCase().includes(searchTerm) ||
                order.user.name.toLowerCase().includes(searchTerm) ||
                order.user.email.toLowerCase().includes(searchTerm)
            );
        }
        setFilteredOrders(result);
    }, [filters, orders]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const getStatusChipClass = (status) => {
        switch (status) {
            case 'Processing': return 'bg-blue-100 text-blue-800';
            case 'Shipped': return 'bg-yellow-100 text-yellow-800';
            case 'Delivered': return 'bg-green-100 text-green-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) return <div className="p-6 text-center">Loading orders...</div>;
    if (error) return <div className="p-6 text-red-600 bg-red-100 rounded-md"><AlertTriangle className="inline mr-2"/>{error}</div>;

    return (
        <div className="container px-4 py-8 mx-auto">
            <h1 className="mb-6 text-2xl font-semibold text-gray-800">Order Management</h1>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
                <div className="relative md:col-span-2">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Search size={20} className="text-gray-400" /></div>
                    <input type="text" name="search" placeholder="Search by Order ID, Customer Name or Email..." onChange={handleFilterChange} className="block w-full py-2 pl-10 pr-3 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>
                <div>
                    <select name="status" onChange={handleFilterChange} className="block w-full py-2 pl-3 pr-10 border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">All Statuses</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Order ID</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Customer</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Total</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.map(order => (
                            <tr key={order._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-mono text-gray-700 whitespace-nowrap">#{order._id.substring(order._id.length - 8)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{order.user.name}</div>
                                    <div className="text-sm text-gray-500">{order.user.email}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-sm font-semibold text-gray-800 whitespace-nowrap">₹{order.totalPrice.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusChipClass(order.orderStatus)}`}>
                                        {order.orderStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                    <button onClick={() => navigate(`/admin/orders/${order._id}`)} className="p-1 text-indigo-600 hover:text-indigo-900" title="View Details">
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredOrders.length === 0 && <p className="p-4 text-center text-gray-500">No orders match the current filters.</p>}
            </div>
        </div>
    );
};

export default AdminOrdersPage;
