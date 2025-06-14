import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, User, ShoppingBag, Shield, LogOut, Menu, X, Home } from 'lucide-react';

const ProfileLayout = () => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    // Effect to handle body scroll lock when the mobile menu is open
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [sidebarOpen]);

    // Effect to close the sidebar on route change (for mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);


    const navLinkClasses = "flex items-center px-4 py-3 text-gray-600 transition-colors duration-200 rounded-lg hover:bg-indigo-50 hover:text-indigo-600";
    const activeNavLinkClasses = "bg-indigo-100 text-indigo-600 font-semibold";

    const accountNavLinks = [
        { href: "/account/dashboard", text: "Dashboard", icon: <LayoutDashboard size={20} /> },
        { href: "/account/orders", text: "My Orders", icon: <ShoppingBag size={20} /> },
        { href: "/account/profile", text: "Profile Settings", icon: <User size={20} /> },
        { href: "/account/security", text: "Security", icon: <Shield size={20} /> },
    ];

    const SidebarContent = () => (
        <div className="p-4 bg-white h-full flex flex-col">
            <div className="flex items-center mb-8 shrink-0">
                <div className="flex items-center justify-center w-12 h-12 mr-4 text-xl font-bold text-white bg-indigo-600 rounded-full">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="text-lg font-bold text-gray-800 line-clamp-1">{user?.name}</p>
                    <p className="text-sm text-gray-500 line-clamp-1">{user?.email}</p>
                </div>
            </div>
            <nav className="flex flex-col justify-between flex-grow">
                <div className="space-y-2">
                    {/* --- ADDED THIS LINK --- */}
                    <Link to="/products" className={navLinkClasses}>
                        <Home size={20} className="mr-3"/>
                        Back to Store
                    </Link>
                    <hr className="my-2"/>
                    {/* --- END OF ADDED LINK --- */}

                    {accountNavLinks.map(link => (
                        <NavLink
                            key={link.href}
                            to={link.href}
                            className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}
                        >
                            {link.icon && <span className="mr-3">{link.icon}</span>}
                            {link.text}
                        </NavLink>
                    ))}
                </div>
                <button
                    onClick={logout}
                    className={`${navLinkClasses} w-full mt-6 text-red-600 hover:bg-red-50`}
                >
                    <LogOut size={20} className="mr-3"/>
                    Logout
                </button>
            </nav>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100">
             {/* --- SLIDE-OUT SIDEBAR (for all screen sizes) --- */}
            <div className={`fixed inset-0 z-50 flex ${sidebarOpen ? "" : "pointer-events-none"}`}>
                {/* Overlay */}
                <div 
                    className={`fixed inset-0 bg-black transition-opacity duration-300 ${sidebarOpen ? "opacity-50" : "opacity-0"}`}
                    onClick={() => setSidebarOpen(false)}
                ></div>
                {/* Sidebar Content */}
                <div className={`relative flex flex-col w-full max-w-xs bg-white shadow-xl transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                     <div className="flex items-center justify-end p-2">
                        <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-full hover:bg-gray-100"><X size={24}/></button>
                     </div>
                     <SidebarContent/>
                </div>
            </div>
            
            <div className="container px-4 py-12 mx-auto">
                <div className="p-6 bg-white rounded-lg shadow-lg">
                    {/* Menu Toggle Button (always visible) */}
                    <button onClick={() => setSidebarOpen(true)} className="flex items-center gap-2 px-4 py-2 mb-6 font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        <Menu size={18}/> My Account Menu
                    </button>
                    {/* The Outlet will render the specific page component (Dashboard, Profile, etc.) */}
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default ProfileLayout;
