import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

const OrderSuccessPage = () => {
    const { orderId } = useParams();

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center bg-white">
            <CheckCircle size={80} className="text-green-500" />
            <h1 className="mt-6 text-3xl font-extrabold text-gray-900">Thank You for Your Order!</h1>
            <p className="mt-2 text-lg text-gray-600">Your order has been placed successfully.</p>
            <p className="mt-1 text-gray-500">
                Your Order ID is: <span className="font-medium text-gray-800">{orderId}</span>
            </p>
            <p className="mt-4 max-w-md text-gray-600">
                You will receive an email confirmation shortly with your order details. You can also view your order history in your profile.
            </p>
            <div className="flex flex-col gap-4 mt-8 sm:flex-row">
                 <Link
                    to="/profile/orders" // Assuming this will be the order history page
                    className="inline-flex items-center justify-center px-6 py-3 font-semibold text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200"
                >
                    View My Orders
                </Link>
                <Link
                    to="/products"
                    className="inline-flex items-center justify-center px-6 py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                    Continue Shopping <ArrowRight size={20} className="ml-2" />
                </Link>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
