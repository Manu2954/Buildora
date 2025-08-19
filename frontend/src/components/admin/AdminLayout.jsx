import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import { useAdminAuth } from '../../context/AdminAuthContext'; // Import useAdminAuth

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { loading } = useAdminAuth(); // Get loading state

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // If auth state is still loading, show a global loading indicator
    if (loading) {
        return (
            <div className="flex items-center justify-center w-screen h-screen bg-background">
                <div className="text-center">
                    {/* You can use a spinner SVG or component here */}
                    <svg className="w-12 h-12 mx-auto text-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-2 text-lg font-medium text-text">Loading Admin Panel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background">
            <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="flex flex-col flex-1 overflow-hidden">
                <AdminNavbar toggleSidebar={toggleSidebar} />
                <main className="flex-1 p-6 overflow-x-hidden overflow-y-auto bg-background mt-16">
                    {/* Outlet is where nested routes will render their components */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
