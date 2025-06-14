import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; // Import the useCart hook
import { ShoppingCart, User, LogIn, Menu, X, Building } from 'lucide-react';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { cartCount } = useCart(); // Get the live cart count
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinkClasses = "px-3 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 rounded-md hover:bg-gray-100 hover:text-gray-900";
    const activeNavLinkClasses = "bg-indigo-50 text-indigo-600";

    const navLinks = [
        { href: "/", text: "Home" },
        { href: "/products", text: "Products" },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="container px-4 mx-auto">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center text-xl font-bold text-gray-800">
                        <Building size={24} className="mr-2 text-indigo-600"/>
                        <span>Buildora</span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex md:items-center md:space-x-2">
                        {navLinks.map(link => (
                            <NavLink
                                key={link.href}
                                to={link.href}
                                className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}
                            >
                                {link.text}
                            </NavLink>
                        ))}
                    </div>

                    {/* Right-side actions */}
                    <div className="flex items-center space-x-4">
                        <Link to="/cart" className="relative p-2 text-gray-600 rounded-full hover:bg-gray-100">
                            <ShoppingCart size={22} />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        
                        <div className="hidden md:flex items-center space-x-2">
                            {isAuthenticated ? (
                                <div className="relative group">
                                    <Link to="/account/dashboard" className="flex items-center p-2 space-x-2 text-gray-600 rounded-full hover:bg-gray-100">
                                        <User size={22} />
                                    </Link>
                                </div>
                            ) : (
                                <Link to="/login" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 transition-colors duration-200 border border-indigo-200 rounded-full hover:bg-indigo-50">
                                    <LogIn size={16}/>
                                    Sign In
                                </Link>
                            )}
                        </div>
                        
                        {/* Mobile Menu Button */}
                        <div className="flex items-center md:hidden">
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="py-4 md:hidden">
                    <div className="container px-4 mx-auto space-y-2">
                         {navLinks.map(link => (
                            <NavLink
                                key={link.href}
                                to={link.href}
                                className={({ isActive }) => `block px-3 py-2 text-base font-medium rounded-md ${isActive ? activeNavLinkClasses : 'text-gray-600 hover:bg-gray-100'}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.text}
                            </NavLink>
                        ))}
                        <div className="pt-4 mt-4 border-t border-gray-200">
                             {isAuthenticated ? (
                                <>
                                    <NavLink to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 rounded-md hover:bg-gray-100">
                                        <User size={20} className="mr-2"/> My Profile
                                    </NavLink>
                                     <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 rounded-md hover:bg-red-50">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700">
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
