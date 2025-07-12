import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { getOrderById, updateOrderStatus } from '../../../services/adminOrderService';
import { ChevronLeft, Package, User, Home, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';

const AdminOrderDetailPage = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { token } = useAdminAuth();

    const fetchOrderDetails = useCallback(async () => {
        if (!token || !orderId) return;
        try {
            const data = await getOrderById(orderId, token);
            setOrder(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch order details.');
        } finally {
            setIsLoading(false);
        }
    }, [orderId, token]);

    useEffect(() => {
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    const handleStatusUpdate = async (newStatus) => {
        setIsUpdating(true);
        setSuccess('');
        setError('');
        try {
            const updatedOrder = await updateOrderStatus(orderId, newStatus, token);
            setOrder(updatedOrder); // Refresh the page with the new order data
            setSuccess(`Order status successfully updated to "${newStatus}"!`);
        } catch (err) {
            setError(err.message || 'Failed to update status.');
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) return <div className="p-6 text-center">Loading order details...</div>;
    if (error) return <div className="p-6 text-red-600 bg-red-100 rounded-md"><AlertTriangle className="inline mr-2"/>{error}</div>;
    if (!order) return <div className="p-6 text-center">No order found.</div>;

    const getStatusChipClass = (status) => {
        switch (status) {
            case 'Processing': return 'bg-blue-100 text-blue-800';
            case 'Shipped': return 'bg-yellow-100 text-yellow-800';
            case 'Delivered': return 'bg-green-100 text-green-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    return (
        <div className="container px-4 py-8 mx-auto">
            <Link to="/admin/orders" className="flex items-center mb-6 text-sm font-semibold text-gray-600 hover:text-gray-900">
                <ChevronLeft size={18} className="mr-1"/> Back to All Orders
            </Link>

            <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order #{order._id}</h1>
                    <p className="text-sm text-gray-500">Placed on: {new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusChipClass(order.orderStatus)}`}>
                        {order.orderStatus}
                    </span>
                </div>
            </div>

            {success && <div className="flex items-center gap-2 p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-md"><CheckCircle size={18}/> {success}</div>}
            
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Main Content: Order Items and Summary */}
                <div className="space-y-8 lg:col-span-2">
                    <div className="p-6 bg-white border rounded-lg shadow-sm">
                        <h2 className="mb-4 text-lg font-bold">Order Items ({order.orderItems.length})</h2>
                        <div className="space-y-4">
                            {order.orderItems.map(item => (
                                <div key={item._id} className="flex items-start gap-4 p-2 border-b last:border-b-0">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 border rounded-md"/>
                                    <div className="flex-grow">
                                        <p className="font-semibold">{item.name}</p>
                                        {item.variant && <p className="text-sm text-gray-500">{item.variant.name}</p>}
                                        <p className="text-sm text-gray-500">Qty: {item.quantity} x ₹{item.price.toFixed(2)}</p>
                                    </div>
                                    <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Customer, Shipping and Actions */}
                <div className="space-y-8 lg:col-span-1">
                    <div className="p-6 bg-white border rounded-lg shadow-sm">
                        <h3 className="flex items-center font-bold text-gray-900"><User size={18} className="mr-2 text-indigo-600"/>Customer Details</h3>
                        <div className="mt-2 text-sm text-gray-600">
                            <p className="font-semibold">{order.user.name}</p>
                            <a href={`mailto:${order.user.email}`} className="text-indigo-600 hover:underline">{order.user.email}</a>
                        </div>
                    </div>
                     <div className="p-6 bg-white border rounded-lg shadow-sm">
                        <h3 className="flex items-center font-bold text-gray-900"><Home size={18} className="mr-2 text-indigo-600"/>Shipping Address</h3>
                        <div className="mt-2 text-sm text-gray-600">
                            <p>{order.shippingAddress.address}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                            <p>{order.shippingAddress.country}</p>
                        </div>
                    </div>
                     <div className="p-6 bg-white border rounded-lg shadow-sm">
                        <h3 className="flex items-center font-bold text-gray-900"><CreditCard size={18} className="mr-2 text-indigo-600"/>Payment Details</h3>
                         <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <div className="flex justify-between"><span>Method:</span><span>{order.paymentMethod}</span></div>
                            <div className="flex justify-between"><span>Status:</span><span className="font-semibold">{order.isPaid ? 'Paid' : 'Not Paid'}</span></div>
                            <hr className="my-2"/>
                            <div className="flex justify-between font-bold text-gray-900"><span>Total:</span><span>₹{order.totalPrice.toFixed(2)}</span></div>
                        </div>
                    </div>
                     <div className="p-6 bg-white border rounded-lg shadow-sm">
                        <h3 className="font-bold text-gray-900">Update Status</h3>
                        <p className="text-xs text-gray-500 mb-2">Change the order's current status.</p>
                        <select 
                            onChange={(e) => handleStatusUpdate(e.target.value)} 
                            value={order.orderStatus}
                            disabled={isUpdating}
                            className="block w-full py-2 pl-3 pr-10 border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetailPage;
