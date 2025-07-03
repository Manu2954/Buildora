import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHomePageData } from '../services/storefrontService';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { ArrowRight, Truck, ShieldCheck, Award, Sparkles, Zap, Star, TrendingUp } from 'lucide-react';

// Particle Background Component
const ParticleBackground = () => {
    useEffect(() => {
        const createParticle = () => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            document.querySelector('.particles')?.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 20000);
        };

        const interval = setInterval(createParticle, 300);
        return () => clearInterval(interval);
    }, []);

    return <div className="particles"></div>;
};

// Hero Section Component
const HeroSection = () => (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <ParticleBackground />
        
        {/* Background Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
            <div className="space-y-8 fade-in">
                {/* Main Heading */}
                <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                        <span className="glass px-4 py-2 rounded-full text-sm font-medium text-white">
                            Welcome to the Future of Building
                        </span>
                        <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-bold text-gradient leading-tight">
                        BUILDORA
                    </h1>
                    
                    <p className="text-2xl md:text-3xl font-light text-white/80 max-w-4xl mx-auto">
                        Sourcing Made Simple. Building Made Easy.
                    </p>
                </div>
                
                {/* Subtitle */}
                <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                    Experience the next generation of construction material sourcing with our AI-powered platform. 
                    Connect with premium suppliers, discover innovative products, and build the future.
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                    <Link to="/products" className="btn-futuristic text-lg px-8 py-4 group">
                        <span>Explore Products</span>
                        <ArrowRight size={20} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                    
                    <Link to="/register" className="glass-card px-8 py-4 rounded-full text-lg font-semibold text-white hover:bg-white/10 transition-all duration-300 border border-white/20">
                        Join the Revolution
                    </Link>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-8 pt-16 max-w-2xl mx-auto">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gradient">1000+</div>
                        <div className="text-sm text-gray-400">Products</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gradient">50+</div>
                        <div className="text-sm text-gray-400">Suppliers</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gradient">24/7</div>
                        <div className="text-sm text-gray-400">Support</div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
            </div>
        </div>
    </section>
);

// Feature Card Component
const FeatureCard = ({ icon, title, description, delay = 0 }) => (
    <div className={`glass-card p-8 text-center space-y-4 card-hover slide-up`} style={{ animationDelay: `${delay}ms` }}>
        <div className="w-16 h-16 mx-auto gradient-primary rounded-2xl flex items-center justify-center pulse-glow">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
);

// Section Component
const Section = ({ children, className = "", id = "" }) => (
    <section id={id} className={`py-20 px-4 ${className}`}>
        <div className="max-w-7xl mx-auto">
            {children}
        </div>
    </section>
);

const HomePage = () => {
    const [homeData, setHomeData] = useState({ featuredCategories: [], bestsellingProducts: [], newArrivals: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const data = await getHomePageData();
            setHomeData(data);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <HeroSection />
            
            {/* Features Section */}
            <Section className="bg-gradient-to-b from-transparent to-black/20">
                <div className="text-center mb-16 fade-in">
                    <h2 className="text-4xl font-bold text-gradient mb-4">Why Choose Buildora?</h2>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Experience the future of construction material sourcing with our cutting-edge platform
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard 
                        icon={<Zap className="w-8 h-8 text-white" />}
                        title="Lightning Fast"
                        description="AI-powered search and instant product discovery. Find what you need in seconds, not hours."
                        delay={0}
                    />
                    <FeatureCard 
                        icon={<ShieldCheck className="w-8 h-8 text-white" />}
                        title="Verified Quality"
                        description="Every supplier is thoroughly vetted. Every product meets our strict quality standards."
                        delay={200}
                    />
                    <FeatureCard 
                        icon={<Award className="w-8 h-8 text-white" />}
                        title="Premium Support"
                        description="24/7 expert assistance from our team of construction industry professionals."
                        delay={400}
                    />
                </div>
            </Section>

            {/* Featured Categories */}
            <Section>
                <div className="text-center mb-16 fade-in">
                    <h2 className="text-4xl font-bold text-gradient mb-4">Featured Categories</h2>
                    <p className="text-xl text-gray-300">Discover our most popular product categories</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {isLoading ? (
                        Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="glass-card h-80 animate-pulse rounded-2xl"></div>
                        ))
                    ) : (
                        (homeData.featuredCategories.slice(0, 2) || []).map((category, index) => (
                            <Link 
                                key={category.name} 
                                to={`/products?categories=${encodeURIComponent(category.name)}`}
                                className="group relative glass-card overflow-hidden rounded-2xl card-hover"
                            >
                                <div className="relative h-80">
                                    <img 
                                        src={category.image} 
                                        alt={category.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                    <div className="absolute bottom-8 left-8 right-8">
                                        <h3 className="text-3xl font-bold text-white mb-2 neon-text">{category.name}</h3>
                                        <p className="text-gray-300 mb-4">Explore premium materials for your projects</p>
                                        <div className="flex items-center text-blue-400 font-semibold">
                                            <span>Shop Now</span>
                                            <ArrowRight size={20} className="ml-2 transition-transform duration-300 group-hover:translate-x-2" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </Section>

            {/* New Arrivals */}
            <Section className="bg-gradient-to-b from-black/20 to-transparent">
                <div className="text-center mb-16 fade-in">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <TrendingUp className="w-6 h-6 text-green-400" />
                        <span className="glass px-4 py-2 rounded-full text-sm font-medium text-white">
                            Latest Additions
                        </span>
                    </div>
                    <h2 className="text-4xl font-bold text-gradient mb-4">New Arrivals</h2>
                    <p className="text-xl text-gray-300">Discover the latest products from our premium suppliers</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                    ) : (
                        (homeData.newArrivals || []).slice(0, 4).map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))
                    )}
                </div>
            </Section>

            {/* Customer Favorites */}
            <Section>
                <div className="text-center mb-16 fade-in">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Star className="w-6 h-6 text-yellow-400" />
                        <span className="glass px-4 py-2 rounded-full text-sm font-medium text-white">
                            Top Rated
                        </span>
                    </div>
                    <h2 className="text-4xl font-bold text-gradient mb-4">Customer Favorites</h2>
                    <p className="text-xl text-gray-300">Most loved products by our community</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                    ) : (
                        (homeData.bestsellingProducts || []).slice(0, 4).map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))
                    )}
                </div>
            </Section>

            {/* Newsletter Section */}
            <Section className="bg-gradient-to-r from-blue-900/20 to-purple-900/20">
                <div className="glass-card p-12 text-center rounded-3xl">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-bold text-gradient">Join the Future</h2>
                            <p className="text-xl text-gray-300">
                                Stay updated with the latest products, exclusive offers, and industry insights
                            </p>
                        </div>
                        
                        <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                className="input-futuristic flex-1"
                            />
                            <button type="submit" className="btn-futuristic whitespace-nowrap">
                                Subscribe Now
                            </button>
                        </form>
                        
                        <p className="text-sm text-gray-400">
                            Join 10,000+ professionals already transforming their sourcing experience
                        </p>
                    </div>
                </div>
            </Section>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gradient">BUILDORA</h3>
                            <p className="text-gray-400">
                                Revolutionizing construction material sourcing with cutting-edge technology.
                            </p>
                        </div>
                        
                        <div className="space-y-4">
                            <h4 className="font-semibold text-white">Quick Links</h4>
                            <div className="space-y-2">
                                <Link to="/products" className="block text-gray-400 hover:text-white transition-colors">Products</Link>
                                <Link to="/about" className="block text-gray-400 hover:text-white transition-colors">About Us</Link>
                                <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors">Contact</Link>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <h4 className="font-semibold text-white">Support</h4>
                            <div className="space-y-2">
                                <Link to="/help" className="block text-gray-400 hover:text-white transition-colors">Help Center</Link>
                                <Link to="/faq" className="block text-gray-400 hover:text-white transition-colors">FAQ</Link>
                                <Link to="/privacy" className="block text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <h4 className="font-semibold text-white">Connect</h4>
                            <div className="flex gap-4">
                                <div className="glass-card p-3 rounded-full hover:scale-110 transition-all duration-300 cursor-pointer">
                                    <div className="w-5 h-5 bg-blue-400 rounded"></div>
                                </div>
                                <div className="glass-card p-3 rounded-full hover:scale-110 transition-all duration-300 cursor-pointer">
                                    <div className="w-5 h-5 bg-purple-400 rounded"></div>
                                </div>
                                <div className="glass-card p-3 rounded-full hover:scale-110 transition-all duration-300 cursor-pointer">
                                    <div className="w-5 h-5 bg-green-400 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="border-t border-white/10 pt-8 text-center">
                        <p className="text-gray-400">
                            &copy; {new Date().getFullYear()} Buildora. All rights reserved. Built for the future.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;