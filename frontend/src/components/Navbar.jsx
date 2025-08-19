import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSite } from '../context/SiteContext';
import { ShoppingCart, User, Heart, Search, Menu, X, Sparkles } from 'lucide-react';

const Navbar = () => {
    const { isAuthenticated } = useAuth();
    const { cartCount } = useCart();
    const { navCategories } = useSite();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinkClasses = "text-muted text-sm font-medium leading-normal transition-all duration-300 hover:text-primary relative group py-2";
    const activeNavLinkClasses = "text-primary font-semibold";

    const navLinks = navCategories.map(category => ({
        href: `/products?categories=${encodeURIComponent(category.name)}`,
        text: category.name
    }));

    const HeaderContent = () => (
        <header className={`sticky top-0 z-50 transition-all duration-500 ${
            isScrolled 
                ? 'bg-surface/95 backdrop-blur-lg border-b border-border/50 shadow-lg' 
                : 'bg-background border-b border-border'
        }`}>
            <div className="flex items-center justify-between whitespace-nowrap px-4 sm:px-6 lg:px-10 py-4">
                {/* Logo Section */}
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse"></div>
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold text-primary tracking-wide">
                                BUILDORA
                            </h2>
                            <span className="text-xs text-muted font-medium -mt-1">
                                Building Made Easy
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center gap-8 lg:flex">
                        {navLinks.map(link => (
                            <NavLink 
                                key={link.text} 
                                to={link.href} 
                                className={({ isActive }) => `
                                    ${navLinkClasses} 
                                    ${isActive ? activeNavLinkClasses : ''}
                                `}
                            >
                                {link.text}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Search and Actions */}
                <div className="flex flex-1 justify-end items-center gap-4">
                    {/* Enhanced Search Bar */}
                    <div className={`hidden sm:flex items-center h-12 px-4 bg-surface border border-border rounded-2xl transition-all duration-300 ${
                        searchFocused 
                            ? 'ring-2 ring-primary/20 border-primary/30 shadow-lg w-80' 
                            : 'hover:border-primary/20 w-64'
                    }`}>
                        <Search size={18} className={`transition-colors duration-300 ${
                            searchFocused ? 'text-primary' : 'text-muted'
                        }`} />
                        <input 
                            placeholder="Search products..." 
                            className="w-full ml-3 text-sm text-text bg-transparent border-none focus:ring-0 focus:outline-none placeholder:text-muted"
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {/* Wishlist Button */}
                        <button className="relative flex items-center justify-center w-12 h-12 bg-surface hover:bg-primary/10 text-muted hover:text-primary rounded-2xl transition-all duration-300 hover:scale-105 border border-border hover:border-primary/20 shadow-sm hover:shadow-md group">
                            <Heart size={20} className="transition-transform duration-300 group-hover:scale-110" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>

                        {/* Cart Button */}
                        <Link 
                            to="/cart" 
                            className="relative flex items-center justify-center w-12 h-12 bg-primary hover:bg-primary-hover text-white rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl group"
                        >
                            <ShoppingCart size={20} className="transition-transform duration-300 group-hover:scale-110" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-error rounded-full animate-bounce-in border-2 border-surface">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User Button */}
                        <Link 
                            to={isAuthenticated ? "/account/dashboard" : "/login"} 
                            className="hidden sm:flex items-center justify-center w-12 h-12 bg-surface hover:bg-primary/10 text-muted hover:text-primary rounded-2xl transition-all duration-300 hover:scale-105 border border-border hover:border-primary/20 shadow-sm hover:shadow-md group"
                        >
                            <User size={20} className="transition-transform duration-300 group-hover:scale-110" />
                        </Link>

                        {/* Mobile Menu Button */}
                        <button 
                            className="lg:hidden flex items-center justify-center w-12 h-12 bg-surface hover:bg-primary/10 text-muted hover:text-primary rounded-2xl transition-all duration-300 hover:scale-105 border border-border hover:border-primary/20 shadow-sm hover:shadow-md"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
    
    return (
        <>
            <HeaderContent />
            
            {/* Enhanced Mobile Menu */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" 
                        onClick={() => setMobileMenuOpen(false)}
                    ></div>
                    
                    {/* Menu Panel */}
                    <div className="relative flex flex-col w-full max-w-sm bg-surface shadow-2xl ml-auto animate-slide-in-right">
                        {/* Menu Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-md">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-lg font-bold text-primary">BUILDORA</span>
                            </div>
                            <button 
                                onClick={() => setMobileMenuOpen(false)} 
                                className="flex items-center justify-center w-10 h-10 bg-background hover:bg-border/20 rounded-full transition-colors duration-300"
                            >
                                <X size={20} className="text-muted" />
                            </button>
                        </div>

                        {/* Search Section */}
                        <div className="p-6 border-b border-border">
                            <div className="flex items-center h-12 px-4 bg-background border border-border rounded-2xl">
                                <Search size={18} className="text-muted" />
                                <input 
                                    placeholder="Search products..." 
                                    className="w-full ml-3 text-sm text-text bg-transparent border-none focus:ring-0 focus:outline-none placeholder:text-muted"
                                />
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex-1 p-6">
                            <div className="space-y-2">
                                {navLinks.map((link, index) => (
                                    <NavLink 
                                        key={link.text} 
                                        to={link.href} 
                                        onClick={() => setMobileMenuOpen(false)} 
                                        className={({ isActive }) => `
                                            flex items-center px-4 py-3 rounded-2xl text-base font-medium transition-all duration-300 animate-fade-in
                                            ${isActive 
                                                ? 'bg-primary/10 text-primary border border-primary/20' 
                                                : 'hover:bg-background text-text hover:text-primary'
                                            }
                                        `}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        {link.text}
                                    </NavLink>
                                ))}
                            </div>
                        </nav>

                        {/* Mobile Actions */}
                        <div className="p-6 border-t border-border">
                            <div className="grid grid-cols-2 gap-4">
                                <Link 
                                    to={isAuthenticated ? "/account/dashboard" : "/login"}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white rounded-2xl font-semibold transition-all duration-300 hover:bg-primary-hover"
                                >
                                    <User size={18} />
                                    <span>{isAuthenticated ? 'Account' : 'Login'}</span>
                                </Link>
                                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-background text-text rounded-2xl font-semibold border border-border transition-all duration-300 hover:bg-border/20">
                                    <Heart size={18} />
                                    <span>Wishlist</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
