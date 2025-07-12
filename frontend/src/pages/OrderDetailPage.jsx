import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrderDetails } from '../services/orderService';
import { ChevronLeft, Package, Home, Truck, AlertTriangle } from 'lucide-react';

const OrderDetailPage = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useAuth();

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!token || !orderId) return;
            try {
                const data = await getOrderDetails(orderId, token);
                setOrder(data);
            } catch (err) {
                setError(err.message || 'Failed to fetch order details.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId, token]);
    
    if (isLoading) return <div className="p-8 text-center">Loading order details...</div>;
    if (error) return <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg"><AlertTriangle className="mx-auto"/>{error}</div>;
    if (!order) return null;
    
    const getStatusColor = (status) => {
        // ... (same as OrdersPage)
        return 'text-blue-600';
    };


    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Link to="/profile/orders" className="flex items-center mb-6 text-sm font-semibold text-gray-600 hover:text-gray-900">
                <ChevronLeft size={18} className="mr-1"/> Back to My Orders
            </Link>
             <h1 className="mb-2 text-2xl font-bold text-gray-900">Order Details</h1>
             <p className="mb-8 text-sm text-gray-500">Order #{order._id}</p>

             <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                 {/* Left column: Items and Summary */}
                <div className="lg:col-span-2">
                    <div className="p-6 bg-white border rounded-lg shadow-sm">
                        <h2 className="mb-4 text-lg font-bold">Items in this Order ({order.orderItems.length})</h2>
                        <div className="space-y-4">
                            {order.orderItems.map(item => (
                                <div key={item._id} className="flex items-start gap-4 p-2 border-b">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 border rounded-md"/>
                                    <div className="flex-grow">
                                        <p className="font-semibold">{item.name}</p>
                                        {item.variant && <p className="text-sm text-gray-500">{item.variant.name}</p>}
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Right column: Shipping and Status */}
                 <div className="lg:col-span-1">
                     <div className="p-6 space-y-6 bg-white border rounded-lg shadow-sm">
                        <div>
                            <h3 className="font-bold text-gray-900 flex items-center"><Truck size={18} className="mr-2 text-indigo-600"/>Order Status</h3>
                            <p className={`mt-1 font-bold ${getStatusColor(order.orderStatus)}`}>{order.orderStatus}</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 flex items-center"><Home size={18} className="mr-2 text-indigo-600"/>Shipping Address</h3>
                            <div className="mt-1 text-sm text-gray-600">
                                <p>{order.shippingAddress.address}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                                <p>{order.shippingAddress.country}</p>
                            </div>
                        </div>
                         <div>
                            <h3 className="font-bold text-gray-900 flex items-center"><Package size={18} className="mr-2 text-indigo-600"/>Order Summary</h3>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                                <div className="flex justify-between"><span>Subtotal:</span><span>₹{order.itemsPrice.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>Shipping:</span><span>₹{order.shippingPrice.toFixed(2)}</span></div>
                                <div className="flex justify-between font-bold text-gray-900 border-t pt-2 mt-2"><span>Total:</span><span>₹{order.totalPrice.toFixed(2)}</span></div>
                            </div>
                        </div>
                    </div>
                 </div>
             </div>
        </div>
    );
};

export default OrderDetailPage;
