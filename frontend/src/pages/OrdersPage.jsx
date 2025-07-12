import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyOrders } from '../services/orderService';
import { Package, ChevronRight, AlertTriangle, ShoppingBag } from 'lucide-react';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { token, loading: authLoading } = useAuth(); // Also get auth loading state

    useEffect(() => {
        const fetchOrders = async () => {
            // Wait for authentication to be confirmed and token to be available
            if (authLoading || !token) {
                // If auth is still loading, do nothing yet.
                // If it's finished and there's no token, we can stop.
                if (!authLoading && !token) {
                    setError("You must be logged in to view orders.");
                    setIsLoading(false);
                }
                return;
            }
            
            console.log("Attempting to fetch orders with token:", token ? "Token Found" : "No Token");

            try {
                const data = await getMyOrders(token);
                
                // --- DEBUGGING STEP ---
                // This will show us exactly what the API is returning.
                console.log("Fetched orders data from API:", data);

                // Ensure data is an array before setting state
                if (Array.isArray(data)) {
                    setOrders(data);
                } else {
                    console.error("API did not return an array of orders. Setting orders to empty.", data);
                    setOrders([]);
                }

            } catch (err) {
                setError(err.message || 'Failed to fetch orders.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [token, authLoading]); // Rerun effect when authLoading status changes

    const getStatusChipClass = (status) => {
        switch (status) {
            case 'Processing':
                return 'bg-blue-100 text-blue-800';
            case 'Shipped':
                return 'bg-yellow-100 text-yellow-800';
            case 'Delivered':
                return 'bg-green-100 text-green-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    
    // Show a more specific loading state
    if (isLoading || authLoading) {
        return <div className="p-8 text-center">Loading your orders...</div>;
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-700 bg-red-50 rounded-lg">
                <AlertTriangle size={48} className="mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Could not load your orders</h3>
                <p>{error}</p>
            </div>
        );
    }
    
    if (orders.length === 0) {
        return (
             <div className="container px-4 py-24 mx-auto text-center bg-white">
                <ShoppingBag size={64} className="mx-auto text-gray-300" />
                <h1 className="mt-6 text-2xl font-bold text-gray-800">No Orders Yet</h1>
                <p className="mt-2 text-gray-600">You haven't placed any orders with us. Let's change that!</p>
                <Link
                    to="/products"
                    className="inline-flex items-center justify-center px-6 py-3 mt-8 font-semibold text-white transition-transform duration-200 bg-indigo-600 rounded-md hover:bg-indigo-700 hover:scale-105"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
             <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-gray-900">My Orders</h1>
             <div className="space-y-6">
                {orders.map(order => (
                    <div key={order._id} className="p-4 bg-white border rounded-lg shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 sm:grid-cols-4">
                                <div>
                                    <p className="font-semibold text-gray-900">Order ID</p>
                                    <p className="truncate">#{order._id.substring(order._id.length - 8)}</p>
                                </div>
                                 <div>
                                    <p className="font-semibold text-gray-900">Date Placed</p>
                                    <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                 <div>
                                    <p className="font-semibold text-gray-900">Total Amount</p>
                                    <p>₹{order.totalPrice.toFixed(2)}</p>
                                </div>
                                 <div>
                                    <p className="font-semibold text-gray-900">Status</p>
                                     <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusChipClass(order.orderStatus)}`}>
                                        {order.orderStatus}
                                    </span>
                                </div>
                            </div>
                            <Link 
                                to={`/account/orders/${order._id}`}
                                className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md sm:ml-4 whitespace-nowrap hover:bg-indigo-700"
                            >
                                View Order <ChevronRight size={16} className="ml-1"/>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrdersPage;
