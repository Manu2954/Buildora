import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getAnalytics } from '../../services/adminDashboardService';
import { Link } from 'react-router-dom';
import { Users, Building, Package, AlertTriangle, BarChart2, DollarSign, ListOrdered, UserCheck, TrendingUp, Calendar, Filter, X, MapPin, BarChart as BarChartIcon, RefreshCw, MessageSquare, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Bar, BarChart } from 'recharts';

// A reusable component for the main KPI cards
const StatCard = ({ title, value, icon, color, subtext }) => (
    <div className={`p-6 bg-white rounded-xl shadow-lg flex items-center justify-between border-l-4 ${color}`}>
        <div>
            <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
        </div>
        <div className="p-3 text-white bg-gray-800 rounded-full">
            {icon}
        </div>
    </div>
);

const AdminDashboardPage = () => {
    const { token } = useAdminAuth();
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ startDate: '', endDate: '' });

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) return;
            setIsLoading(true);
            setError(null);
            try {
                const activeFilters = {};
                if (filters.startDate) activeFilters.startDate = filters.startDate;
                if (filters.endDate) activeFilters.endDate = filters.endDate;
                
                const data = await getAnalytics(activeFilters, token);
                console.log("ji",data)
                setStats(data);
            } catch (err) {
                setError(err.message || "Could not load dashboard data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [token, filters]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const clearDateFilters = () => {
        setFilters({ startDate: '', endDate: '' });
    };

    const PIE_COLORS = ['#C69B4B', '#B1873E', '#16A34A', '#D97706', '#DC2626', '#2563EB'];

    if (isLoading) {
        return <div className="p-6 text-center">Loading Analytics Dashboard...</div>;
    }
    
    if (error) {
        return <div className="p-6 text-red-600 bg-red-100 rounded-md"><AlertTriangle className="inline mr-2"/>{error}</div>;
    }

    const safeStats = {
        totalRevenue: stats?.totalRevenue ?? 0,
        totalOrders: stats?.totalOrders ?? 0,
        totalCustomers: stats?.totalCustomers ?? 0,
        salesOverTime: stats?.salesOverTime || [],
        orderStatusDistribution: stats?.orderStatusDistribution || [],
        revenueByCategory: stats?.revenueByCategory || [],
        revenueByLocation: stats?.revenueByLocation || [],
        newCustomerTrend: stats?.newCustomerTrend || [],
        topSellingProducts: stats?.topSellingProducts || [],
        topCustomers: stats?.topCustomers || [],
        topSearchTerms: stats?.topSearchTerms || [],
    };
    console.log(safeStats)
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">
                Admin Dashboard
            </h1>

            <div className="p-4 bg-white border rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                    <h3 className="flex items-center text-lg font-semibold"><Filter size={20} className="mr-2"/> Filter by Date</h3>
                     {(filters.startDate || filters.endDate) && (
                        <button onClick={clearDateFilters} className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                           <X size={16} className="mr-1"/> Clear
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 gap-4 mt-2 sm:grid-cols-2">
                    <div><label className="text-sm">Start Date</label><input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/></div>
                    <div><label className="text-sm">End Date</label><input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/></div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Revenue" value={`₹${safeStats.totalRevenue.toFixed(2)}`} icon={<DollarSign size={24} />} color="border-green-500" subtext="From delivered orders"/>
                <StatCard title="Total Orders" value={safeStats.totalOrders} icon={<ListOrdered size={24} />} color="border-blue-500" subtext="In selected period"/>
                <StatCard title="New Customers" value={safeStats.totalCustomers} icon={<Users size={24} />} color="border-purple-500" subtext="In selected period"/>
                <StatCard title="Return Rate" value="0%" icon={<RefreshCw size={24} />} color="border-orange-500" subtext="Feature coming soon"/>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="p-6 bg-white rounded-xl shadow-lg lg:col-span-2">
                     <h2 className="mb-4 text-xl font-semibold text-gray-700 flex items-center"><TrendingUp size={22} className="mr-3 text-primary" /> Sales Revenue</h2>
                    <ResponsiveContainer width="100%" height={300}><LineChart data={safeStats.salesOverTime}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip formatter={(value) => `₹${value.toFixed(2)}`} /><Legend /><Line type="monotone" dataKey="sales" stroke="#C69B4B" strokeWidth={2} activeDot={{ r: 8 }} /></LineChart></ResponsiveContainer>
                </div>
                 <div className="p-6 bg-white rounded-xl shadow-lg">
                     <h2 className="mb-4 text-xl font-semibold text-gray-700 flex items-center"><BarChart2 size={22} className="mr-3 text-primary" /> Order Status Distribution</h2>
                     <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={safeStats.orderStatusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>{safeStats.orderStatusDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                 <div className="p-6 bg-white rounded-xl shadow-lg">
                     <h2 className="mb-4 text-xl font-semibold text-gray-700 flex items-center"><BarChartIcon size={22} className="mr-3 text-primary" /> Revenue by Category</h2>
                     <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={safeStats.revenueByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#C69B4B" paddingAngle={5} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>{safeStats.revenueByCategory.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}</Pie><Tooltip formatter={(value, name) => [`₹${value.toFixed(2)}`, name]} /><Legend /></PieChart></ResponsiveContainer>
                </div>
                 <div className="p-6 bg-white rounded-xl shadow-lg lg:col-span-2">
                     <h2 className="mb-4 text-xl font-semibold text-gray-700 flex items-center"><MapPin size={22} className="mr-3 text-primary" /> Revenue by Location</h2>
                     <ResponsiveContainer width="100%" height={300}><BarChart data={safeStats.revenueByLocation} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis type="category" dataKey="name" width={80} /><Tooltip formatter={(value) => `₹${value.toFixed(2)}`} /><Legend /><Bar dataKey="revenue" fill="#C69B4B" barSize={20} /></BarChart></ResponsiveContainer>
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                 <div className="p-6 bg-white rounded-xl shadow-lg">
                     <h2 className="mb-4 text-xl font-semibold text-gray-700 flex items-center"><Search size={22} className="mr-3 text-primary"/>Top Search Terms</h2>
                    <ul className="space-y-3">
                        {/* --- THE FIX IS HERE --- */}
                        {/* The component now correctly displays the 'item.term' */}
                        {safeStats.topSearchTerms.map((item, index) => (
                            <li key={index} className="flex justify-between p-2 rounded-md hover:bg-gray-50">
                                <span className="font-medium text-gray-800 capitalize">{item.term}</span>
                                <span className="font-bold text-gray-600">{item.count} searches</span>
                            </li>
                        ))}
                         {safeStats.topSearchTerms.length === 0 && <p className="text-sm text-center text-gray-500 py-4">No search data available for this period.</p>}
                    </ul>
                </div>
                 <div className="p-6 bg-white rounded-xl shadow-lg lg:col-span-2">
                     <h2 className="mb-4 text-xl font-semibold text-gray-700 flex items-center"><UserCheck size={22} className="mr-3 text-primary" /> New Customer Trend</h2>
                    <ResponsiveContainer width="100%" height={300}><LineChart data={safeStats.newCustomerTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis allowDecimals={false} /><Tooltip formatter={(value) => [`${value} new customers`]} /><Legend /><Line type="monotone" dataKey="count" name="New Customers" stroke="#C69B4B" strokeWidth={2} /></LineChart></ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="p-6 bg-white rounded-xl shadow-lg">
                    <h2 className="mb-4 text-xl font-semibold text-gray-700 flex items-center"><Package size={22} className="mr-3 text-primary"/>Top Selling Products</h2>
                    <ul className="space-y-3">{safeStats.topSellingProducts.map((product, index) => (<li key={index} className="flex justify-between p-2 rounded-md hover:bg-gray-50"><span className="font-medium text-gray-800">{product.name}</span><span className="font-bold text-gray-600">{product.quantity} sold</span></li>))}</ul>
                </div>
                 <div className="p-6 bg-white rounded-xl shadow-lg">
                    <h2 className="mb-4 text-xl font-semibold text-gray-700 flex items-center"><UserCheck size={22} className="mr-3 text-primary"/>Top Customers by Revenue</h2>
                    <ul className="space-y-3">{safeStats.topCustomers.map((customer, index) => (<li key={index} className="flex justify-between p-2 rounded-md hover:bg-gray-50"><div><p className="font-medium text-gray-800">{customer.name}</p><p className="text-xs text-gray-500">{customer.email}</p></div><span className="font-bold text-gray-600">₹{customer.spent.toFixed(2)}</span></li>))}</ul>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
