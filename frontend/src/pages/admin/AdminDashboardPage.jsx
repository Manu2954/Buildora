import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getDashboardStats } from '../../services/adminDashboardService';
import { Link } from 'react-router-dom';
import { Users, Building, Package, AlertTriangle, BarChart2, UserPlus } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Redesigned StatCard component with gradients and better styling
const StatCard = ({ title, value, icon, color, linkTo }) => (
    <Link to={linkTo} className="relative block p-6 overflow-hidden text-white bg-white rounded-xl shadow-lg group">
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-90 group-hover:opacity-100 transition-opacity duration-300`}></div>
        <div className="relative z-10">
            <div className="flex items-start justify-between">
                <div className="p-3 bg-white bg-opacity-25 rounded-full">
                    {icon}
                </div>
            </div>
            <div className="mt-4">
                <p className="text-4xl font-bold">{value}</p>
                <p className="text-sm font-medium uppercase opacity-80">{title}</p>
            </div>
        </div>
    </Link>
);

const AdminDashboardPage = () => {
    const { admin, token } = useAdminAuth();
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) return;
            setIsLoading(true);
            setError(null);
            try {
                const data = await getDashboardStats(token);
                setStats(data);
            } catch (err) {
                console.error("Failed to fetch dashboard stats:", err);
                setError(err.message || "Could not load dashboard data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full p-10">
                 <svg className="w-12 h-12 text-indigo-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="ml-4 text-lg text-gray-600">Loading Dashboard...</p>
            </div>
        );
    }
    
    if (error) {
        return (
             <div className="p-8 mx-auto my-10 max-w-lg text-center text-red-800 bg-red-100 border-2 border-red-300 rounded-lg">
                <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
                <h2 className="text-xl font-semibold">Could not load dashboard data</h2>
                <p className="mt-2">{error}</p>
            </div>
        );
    }

    return (
        <div className="container px-4 py-8 mx-auto font-sans">
            <h1 className="mb-2 text-3xl font-bold text-gray-800">
                Dashboard Overview
            </h1>
            <p className="mb-8 text-lg text-gray-500">
                Welcome back, {admin?.name || 'Admin'}! Here's a summary of your platform.
            </p>

            {/* Statistic Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard title="Total Users" value={stats?.totalUsers ?? 0} icon={<Users size={28} />} color="from-blue-500 to-indigo-600" linkTo="/admin/users" />
                <StatCard title="Total Companies" value={stats?.totalCompanies ?? 0} icon={<Building size={28} />} color="from-green-500 to-emerald-600" linkTo="/admin/companies" />
                <StatCard title="Total Products" value={stats?.totalProducts ?? 0} icon={<Package size={28} />} color="from-amber-500 to-orange-600" linkTo="/admin/products" />
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 gap-8 mt-8 lg:grid-cols-5">
                {/* User Roles Chart */}
                <div className="p-6 bg-white rounded-xl shadow-lg lg:col-span-2">
                     <h2 className="mb-4 text-xl font-semibold text-gray-700 flex items-center">
                        <BarChart2 size={22} className="mr-3 text-indigo-500" />
                        User Roles
                    </h2>
                    {stats?.userRoles && stats.userRoles.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={stats.userRoles}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    nameKey="name"
                                >
                                    {stats.userRoles.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} className="focus:outline-none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '0.75rem',
                                        borderColor: '#e5e7eb',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                                    }}
                                />
                                <Legend iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                             <BarChart2 size={48} className="mb-4 opacity-50" />
                             <p>No user role data available.</p>
                        </div>
                    )}
                </div>

                {/* Recent Users List */}
                 <div className="p-6 bg-white rounded-xl shadow-lg lg:col-span-3">
                    <h2 className="mb-4 text-xl font-semibold text-gray-700 flex items-center">
                        <UserPlus size={22} className="mr-3 text-indigo-500" />
                        Recently Registered Users
                    </h2>
                     <div className="space-y-3">
                        {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                            stats.recentUsers.map(user => (
                                <div key={user._id} className="flex items-center justify-between p-3 transition duration-200 rounded-lg hover:bg-gray-100">
                                    <div className="flex items-center">
                                         <div className="flex items-center justify-center w-10 h-10 mr-4 text-indigo-600 bg-indigo-100 rounded-full">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{user.name}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))
                        ) : (
                             <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                 <UserPlus size={48} className="mb-4 opacity-50" />
                                 <p>No recent user registrations.</p>
                            </div>
                        )}
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
