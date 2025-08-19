import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { LogOut, User, Settings, LayoutDashboard } from 'lucide-react';
import Logo from '../Logo'; // Using lucide-react for icons

const AdminNavbar = ({ toggleSidebar }) => {
    const { admin, logout } = useAdminAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <nav className="bg-white shadow-md fixed w-full z-10 top-0">
            <div className="px-4 mx-auto max-w-full">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <button
                            onClick={toggleSidebar}
                            className="mr-4 text-muted hover:text-text focus:outline-none"
                            aria-label="Toggle sidebar"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                        <Link to="/admin/dashboard" className="text-xl font-bold text-primary">
                            Buildora Admin
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        {admin && (
                            <span className="text-sm text-muted">
                                Welcome, {admin.name} ({admin.role})
                            </span>
                        )}
                        <button
                            onClick={handleLogout}
                            className="flex items-center px-3 py-2 text-sm font-medium text-red-500 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <LogOut size={18} className="mr-1" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default AdminNavbar;
