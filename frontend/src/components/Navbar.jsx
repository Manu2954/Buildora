import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSite } from '../context/SiteContext';
import { ShoppingCart, User, Heart, Search, Menu, X } from 'lucide-react';

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

    const navLinkClasses = "text-muted text-sm font-medium leading-normal transition-colors hover:text-primary";
    const activeNavLinkClasses = "text-primary font-bold";

    // The navLinks array is now built dynamically from the context
    const navLinks = navCategories.map(category => ({
        href: `/products?categories=${encodeURIComponent(category.name)}`,
        text: category.name
    }));

    const HeaderContent = () => (
        // --- THIS IS THE REDESIGNED HEADER ---
        <header className={`flex items-center justify-between whitespace-nowrap border-b border-solid border-border px-4 sm:px-10 py-3 transition-all duration-300 bg-background`}>
            <div className="flex items-center gap-8">
                <Link to="/" className="flex items-center gap-4">
                <img
                src={`${process.env.REACT_APP_API_URL}/images/buildora-icon.png`}
                // src={`http://localhost:5000/images/buildora-icon.png`}
                alt="logo"
                className="w-10 h-10 text-primary"
                onError={(e) => { e.target.src = 'https://placehold.co/600x400/e2e8f0/475569?text=Promotion'; }}
            />
                    {/* <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#c59c46]"><path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="currentColor"></path></svg> */}
                    {/* This requires you to load 'The Seasons' font in your project's main CSS file. */}
                    <h2 className="text-xl font-bold uppercase text-primary" style={{ fontFamily: "'The Seasons'" }}>
                        BUILDORA
                    </h2>
                </Link>
                <div className="hidden items-center gap-9 lg:flex">
                    {navLinks.map(link => (
                        <NavLink key={link.text} to={link.href} className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>{link.text}</NavLink>
                    ))}
                </div>
            </div>
            <div className="flex flex-1 justify-end items-center gap-4">
                <div className="hidden sm:flex items-center h-10 px-3 bg-text rounded-full">
                    <Search size={18} className="text-surface"/>
                    <input placeholder="Search" className="w-24 ml-2 text-sm text-surface bg-transparent border-none sm:w-32 focus:ring-0 focus:outline-none placeholder:text-muted" />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center justify-center w-10 h-10 bg-primary rounded-full hover:bg-primary-hover text-white"><Heart size={20}/></button>
                    <Link to="/cart" className="relative flex items-center justify-center w-10 h-10 bg-primary rounded-full hover:bg-primary-hover text-white">
                        <ShoppingCart size={20}/>
                        {cartCount > 0 && <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-error rounded-full">{cartCount}</span>}
                    </Link>
                    <Link to={isAuthenticated ? "/account/dashboard" : "/login"} className="hidden sm:flex items-center justify-center w-10 h-10 bg-primary rounded-full hover:bg-primary-hover text-white"><User size={20}/></Link>
                </div>
                 <button className="lg:hidden text-text" onClick={() => setMobileMenuOpen(true)}><Menu size={24}/></button>
            </div>
        </header>
    );
    
    return (
        <>
            <div className="sticky top-0 z-50"><HeaderContent/></div>
            
            {/* Mobile Menu */}
             {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div className="fixed inset-0 bg-black/30" onClick={() => setMobileMenuOpen(false)}></div>
                    <div className="relative flex flex-col w-full max-w-xs p-4 bg-white">
                        <button onClick={() => setMobileMenuOpen(false)} className="self-end p-2 mb-4"><X size={24}/></button>
                        <nav className="flex flex-col space-y-4">
                             {navLinks.map(link => (
                                <NavLink key={link.text} to={link.href} onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `px-4 py-2 rounded-md text-lg ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-background'}`}>{link.text}</NavLink>
                            ))}
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
