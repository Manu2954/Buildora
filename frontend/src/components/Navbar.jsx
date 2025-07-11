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

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinkClasses = "relative text-gray-300 text-sm font-medium leading-normal transition-all duration-300 hover:text-white group";
    const activeNavLinkClasses = "text-white font-bold";

    const navLinks = navCategories.map(category => ({
        href: `/products?categories=${encodeURIComponent(category.name)}`,
        text: category.name
    }));

    const HeaderContent = () => (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            isScrolled 
                ? 'glass backdrop-blur-strong border-b border-white/10' 
                : 'bg-transparent'
        }`}>
            <div className="flex items-center justify-between px-4 sm:px-10 py-4">
                {/* Logo Section */}
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center pulse-glow">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gradient tracking-wider">
                            BUILDORA
                        </h2>
                    </Link>
                    
                    {/* Desktop Navigation */}
                    <nav className="hidden items-center gap-8 lg:flex">
                        {navLinks.map(link => (
                            <NavLink 
                                key={link.text} 
                                to={link.href} 
                                className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}
                            >
                                {link.text}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    {/* Search Bar */}
                    <div className="hidden sm:flex items-center glass rounded-full px-4 py-2 min-w-[200px]">
                        <Search size={18} className="text-gray-400 mr-2"/>
                        <input 
                            placeholder="Search products..." 
                            className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus:outline-none text-sm"
                        />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button className="glass-card p-3 rounded-full hover:scale-110 transition-all duration-300 group">
                            <Heart size={20} className="text-gray-300 group-hover:text-red-400 transition-colors"/>
                        </button>
                        
                        <Link to="/cart" className="relative glass-card p-3 rounded-full hover:scale-110 transition-all duration-300 group">
                            <ShoppingCart size={20} className="text-gray-300 group-hover:text-blue-400 transition-colors"/>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        
                        <Link 
                            to={isAuthenticated ? "/account/dashboard" : "/login"} 
                            className="hidden sm:flex glass-card p-3 rounded-full hover:scale-110 transition-all duration-300 group"
                        >
                            <User size={20} className="text-gray-300 group-hover:text-green-400 transition-colors"/>
                        </Link>
                    </div>
                    
                    {/* Mobile Menu Button */}
                    <button 
                        className="lg:hidden glass-card p-3 rounded-full hover:scale-110 transition-all duration-300"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <Menu size={20} className="text-white"/>
                    </button>
                </div>
            </div>
        </header>
    );
    
    return (
        <>
            <HeaderContent/>
            
            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div 
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
                        onClick={() => setMobileMenuOpen(false)}
                    ></div>
                    <div className="relative flex flex-col w-full max-w-sm glass-card ml-auto h-full rounded-l-3xl">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h3 className="text-xl font-bold text-gradient">Menu</h3>
                            <button 
                                onClick={() => setMobileMenuOpen(false)} 
                                className="glass-card p-2 rounded-full hover:scale-110 transition-all duration-300"
                            >
                                <X size={20} className="text-white"/>
                            </button>
                        </div>
                        
                        <nav className="flex flex-col p-6 space-y-4">
                            {navLinks.map(link => (
                                <NavLink 
                                    key={link.text} 
                                    to={link.href} 
                                    onClick={() => setMobileMenuOpen(false)} 
                                    className={({ isActive }) => `
                                        glass-card px-6 py-4 rounded-xl text-lg font-medium transition-all duration-300
                                        ${isActive ? 'gradient-primary text-white' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                                    `}
                                >
                                    {link.text}
                                </NavLink>
                            ))}
                            
                            <div className="pt-4 border-t border-white/10">
                                <Link 
                                    to={isAuthenticated ? "/account/dashboard" : "/login"}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="glass-card px-6 py-4 rounded-xl text-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 flex items-center gap-3"
                                >
                                    <User size={20}/>
                                    {isAuthenticated ? 'My Account' : 'Sign In'}
                                </Link>
                            </div>
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;