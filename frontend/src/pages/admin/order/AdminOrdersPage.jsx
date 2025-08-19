import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { getAllOrders } from '../../../services/adminOrderService';
import { Eye, Search, AlertTriangle, Filter, X } from 'lucide-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css'; // Import the slider's CSS

// Custom hook for debouncing input.
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Updated initial filters to use a priceRange array
    const initialFilters = { 
        status: '', 
        paymentMethod: '', 
        startDate: '', 
        endDate: '', 
        priceRange: [0, 50000] // Default range [min, max]
    };
    const [filters, setFilters] = useState(initialFilters);
    
    const debouncedFilters = useDebounce(filters, 500);

    const { token } = useAdminAuth();
    const navigate = useNavigate();

    const fetchOrders = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        setError('');
        try {
            const filtersToApply = { ...debouncedFilters };
            
            // Convert priceRange array to minPrice and maxPrice for the API
            filtersToApply.minPrice = filtersToApply.priceRange[0];
            filtersToApply.maxPrice = filtersToApply.priceRange[1];
            delete filtersToApply.priceRange; // Clean up the object

            // Remove empty filters
            Object.keys(filtersToApply).forEach(key => !filtersToApply[key] && delete filtersToApply[key]);
            
            const data = await getAllOrders(filtersToApply, token);
            setOrders(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch orders.');
        } finally {
            setIsLoading(false);
        }
    }, [token, debouncedFilters]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePriceRangeChange = (value) => {
        setFilters(prev => ({ ...prev, priceRange: value }));
    };

    const resetFilters = () => {
        setFilters(initialFilters);
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

            {/* Filter Section */}
            <div className="p-4 mb-6 bg-white border rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                    <h3 className="flex items-center text-lg font-semibold"><Filter size={20} className="mr-2"/> Filter Orders</h3>
                     <button onClick={resetFilters} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                       <X size={16} className="mr-1"/> Reset Filters
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Status and Payment Filters */}
                    <div><label className="text-sm">Status</label><select name="status" value={filters.status} onChange={handleFilterChange} className="w-full mt-1 border-gray-300 rounded-md shadow-sm"><option value="">All</option><option value="Processing">Processing</option><option value="Shipped">Shipped</option><option value="Delivered">Delivered</option><option value="Cancelled">Cancelled</option></select></div>
                    <div><label className="text-sm">Payment</label><select name="paymentMethod" value={filters.paymentMethod} onChange={handleFilterChange} className="w-full mt-1 border-gray-300 rounded-md shadow-sm"><option value="">All</option><option value="Cash on Delivery">Cash on Delivery</option><option value="Stripe">Stripe</option></select></div>
                    {/* Date Filters */}
                    <div><label className="text-sm">Start Date</label><input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/></div>
                    <div><label className="text-sm">End Date</label><input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/></div>
                    
                    {/* Price Range Slider */}
                    <div className="md:col-span-2">
                        <label className="text-sm">Price Range (₹)</label>
                        <div className="px-2 pt-2">
                             <Slider
                                range
                                min={0}
                                max={50000} // Set a reasonable max for the slider
                                value={filters.priceRange}
                                onChange={handlePriceRangeChange}
                                trackStyle={[{ backgroundColor: '#C69B4B' }]}
                                handleStyle={[{ borderColor: '#C69B4B', borderWidth: 2 }, { borderColor: '#C69B4B', borderWidth: 2 }]}
                                railStyle={{ backgroundColor: '#D9D9D9' }}
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <span>₹{filters.priceRange[0]}</span>
                            <span>₹{filters.priceRange[1]}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    {/* ... table head remains the same ... */}
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
                        {orders.map(order => (
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
                                    <button onClick={() => navigate(`/admin/orders/${order._id}`)} className="p-1 text-primary hover:text-primary-hover" title="View Details">
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {orders.length === 0 && !isLoading && <p className="p-4 text-center text-gray-500">No orders match the current filters.</p>}
            </div>
        </div>
    );
};

export default AdminOrdersPage;
