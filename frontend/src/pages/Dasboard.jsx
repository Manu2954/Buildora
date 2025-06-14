import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ShoppingBag, User } from 'lucide-react';

const ActionCard = ({ to, title, description, icon }) => (
    <Link to={to} className="relative block p-8 overflow-hidden transition-all duration-300 bg-white border rounded-lg shadow-sm group hover:shadow-xl hover:-translate-y-1">
        <div className="absolute top-0 right-0 p-3 text-indigo-100 transition-transform duration-500 bg-indigo-500 rounded-bl-full group-hover:scale-150">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-gray-600">{description}</p>
        <div className="flex items-center mt-6 text-sm font-semibold text-indigo-600">
            Go to {title} <ArrowRight size={16} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
    </Link>
);


const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div>
            <div className="pb-6 mb-8 border-b">
                <h1 className="text-3xl font-bold text-gray-800">
                    Hello, {user?.name}!
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                    Welcome to your Buildora dashboard.
                </p>
            </div>
            
            <p className="mb-8 text-gray-700">
                This is your personal space to manage all your activities on Buildora. From here, you can track your orders, update your personal information, and enhance your account security.
            </p>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <ActionCard 
                    to="/account/orders" 
                    title="My Orders" 
                    description="View your complete order history and track the status of your recent purchases."
                    icon={<ShoppingBag size={24} />}
                />
                <ActionCard 
                    to="/account/profile" 
                    title="Profile Settings" 
                    description="Update your name, email, and manage your shipping and billing addresses."
                    icon={<User size={24} />}
                />
            </div>
        </div>
    );
};

export default Dashboard;
