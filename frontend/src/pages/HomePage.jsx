import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHomePageData } from '../services/storefrontService';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import Slider from "react-slick";
import { ArrowRight, Star, Sparkles } from 'lucide-react';
import Logo from '../components/Logo';
import "slick-carousel/slick/slick.css"; 

const HomePage = () => {
    const [homeData, setHomeData] = useState({ featuredCategories: [], bestsellingProducts: [], newArrivals: [], activeAdvertisements: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await getHomePageData();
                setHomeData(data || { featuredCategories: [], bestsellingProducts: [], newArrivals: [], activeAdvertisements: [] });
            } catch (error) {
                console.error("Failed to fetch homepage data:", error);
                setHomeData({ featuredCategories: [], bestsellingProducts: [], newArrivals: [], activeAdvertisements: [] });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const adSliderSettings = {
        dots: true,
        infinite: true,
        speed: 800,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        pauseOnHover: true,
        arrows: true,
        fade: true,
        cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
        dotsClass: "slick-dots slick-thumb",
        customPaging: () => (
            <div className="w-3 h-3 bg-white/50 rounded-full transition-all duration-300 hover:bg-white/80"></div>
        ),
    };

    const SectionHeader = ({ title, subtitle, icon: Icon }) => (
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in">
            {Icon && (
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-6">
                    <Icon size={32} />
                </div>
            )}
            <h2 className="text-4xl font-bold text-text mb-4 tracking-tight">{title}</h2>
            {subtitle && (
                <p className="text-lg text-muted leading-relaxed">{subtitle}</p>
            )}
        </div>
    );

    return (
        <div className="bg-surface">
            <main>
                {/* Enhanced Hero Section */}
                <section className="relative w-full overflow-hidden">
                    {isLoading ? (
                        <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 aspect-[16/7] animate-pulse">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                    ) : homeData.activeAdvertisements && homeData.activeAdvertisements.length > 0 ? (
                        <div className="relative">
                            <Slider {...adSliderSettings}>
                                {homeData.activeAdvertisements.map(ad => (
                                    <div key={ad._id} className="relative">
                                        <Link to={ad.linkTo} className="block w-full h-[50vh] md:h-[70vh] relative overflow-hidden group">
                                            <img 
                                                src={ad.imageUrl}
                                                alt={ad.name}
                                                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" 
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40"></div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                                                <div className="max-w-4xl mx-auto">
                                                    <h1 className="text-3xl md:text-5xl font-bold mb-4 text-shadow-lg">{ad.name}</h1>
                                                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 transition-all duration-300 hover:bg-white/20">
                                                        <span className="font-semibold">Explore Now</span>
                                                        <ArrowRight size={20} />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </Slider>
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full -translate-x-16 -translate-y-16 animate-pulse"></div>
                                <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/5 rounded-full translate-x-12 translate-y-12 animate-pulse" style={{animationDelay: '1s'}}></div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative w-full h-[50vh] md:h-[70vh] bg-gradient-to-br from-primary/20 to-primary/5">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center max-w-2xl mx-auto px-6">
                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 text-primary rounded-full mb-6 animate-bounce">
                                        <Sparkles size={40} />
                                    </div>
                                    <div className="flex flex-col items-center mb-6">
                                        <h1 className="text-4xl md:text-6xl font-bold text-text mb-4 tracking-tight">Welcome to</h1>
                                        <Logo variant="full" size="xl" showText={true} textClassName="text-4xl md:text-6xl font-bold" />
                                    </div>
                                    <p className="text-xl text-muted mb-8 leading-relaxed">Sourcing Made Simple. Building Made Easy.</p>
                                    <Link to="/products" className="inline-flex items-center gap-3 bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
                                        <span>Start Shopping</span>
                                        <ArrowRight size={20} />
                                    </Link>
                                </div>
                            </div>
                            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full -translate-x-16 -translate-y-16 animate-pulse"></div>
                            <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/5 rounded-full translate-x-12 translate-y-12 animate-pulse" style={{animationDelay: '1s'}}></div>
                        </div>
                    )}
                </section>
                
                {/* Enhanced Featured Products Section */}
                <section className="py-24 bg-surface">
                    <div className="container px-6 mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
                            <div className="lg:col-span-1 flex flex-col justify-center">
                                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6 w-fit">
                                    <Star size={16} className="fill-current" />
                                    <span>Featured Collection</span>
                                </div>
                                <h2 className="text-4xl font-bold text-text mb-6 leading-tight">Crafted with excellent material.</h2>
                                <p className="text-lg text-muted mb-8 leading-relaxed">Discover durable and versatile items for all your construction and design needs. Built to last, designed to impress.</p>
                                <Link to="/products" className="inline-flex items-center gap-3 bg-text hover:bg-text/90 text-surface font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:shadow-lg w-fit">
                                    <span>Explore Collection</span>
                                    <ArrowRight size={20} />
                                </Link>
                            </div>
                            <div className="lg:col-span-2">
                                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                    {isLoading ? (
                                        Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={i} />)
                                    ) : (
                                        (homeData.bestsellingProducts || []).slice(0, 3).map((product, index) => (
                                            <div key={product._id} className="animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                                                <ProductCard product={product} />
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Enhanced Featured Categories Section */}
                <section className="py-24 bg-background relative overflow-hidden">
                    <div className="absolute inset-0">
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/3 rounded-full blur-3xl"></div>
                    </div>
                    <div className="container px-6 mx-auto max-w-7xl relative">
                        <SectionHeader 
                            title="Shop by Category" 
                            subtitle="Find exactly what you need from our carefully curated categories"
                        />
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-80 bg-border/30 rounded-2xl animate-pulse"></div>
                                ))
                            ) : (
                                (homeData.featuredCategories || []).map((category, index) => (
                                    <Link 
                                        key={category.name} 
                                        to={`/products?categories=${encodeURIComponent(category.name)}`} 
                                        className="relative block overflow-hidden rounded-2xl shadow-lg group animate-fade-in hover:shadow-2xl transition-all duration-500"
                                        style={{animationDelay: `${index * 150}ms`}}
                                    >
                                        <div className="relative h-80 overflow-hidden">
                                            <img 
                                                src={category.image} 
                                                alt={category.name} 
                                                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
                                            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 p-8">
                                            <div className="transform transition-transform duration-300 group-hover:translate-y-0 translate-y-2">
                                                <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                                                <div className="inline-flex items-center gap-2 text-white/90 group-hover:text-white transition-colors duration-300">
                                                    <span className="text-sm font-medium">Shop now</span>
                                                    <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* Enhanced New Arrivals Section */}
                <section className="py-24 bg-surface">
                    <div className="container px-6 mx-auto max-w-7xl">
                        <SectionHeader 
                            title="New Arrivals" 
                            subtitle="Latest additions to our collection, fresh from the warehouse"
                            icon={Sparkles}
                        />
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                            ) : (
                                (homeData.newArrivals || []).slice(0, 4).map((product, index) => (
                                    <div key={product._id} className="animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                                        <ProductCard product={product} />
                                    </div>
                                ))
                            )}
                        </div>
                        {!isLoading && homeData.newArrivals && homeData.newArrivals.length > 4 && (
                            <div className="text-center mt-12">
                                <Link to="/products?sort=newest" className="inline-flex items-center gap-3 border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold px-8 py-4 rounded-full transition-all duration-300">
                                    <span>View All New Arrivals</span>
                                    <ArrowRight size={20} />
                                </Link>
                            </div>
                        )}
                    </div>
                </section>                
            </main>
            
            {/* Enhanced Footer Section */}
            <footer className="relative py-20 text-muted bg-text overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full -translate-x-48 -translate-y-48 blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/3 rounded-full translate-x-40 translate-y-40 blur-3xl"></div>
                </div>
                <div className="container px-6 mx-auto max-w-7xl relative">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-4 mb-8">
                            <Logo variant="full" size="medium" showText={true} textClassName="text-2xl font-bold text-surface" />
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-8 mb-12">
                            <Link to="/about" className="text-surface/70 hover:text-primary transition-colors duration-300 font-medium">About Us</Link>
                            <Link to="/contact" className="text-surface/70 hover:text-primary transition-colors duration-300 font-medium">Contact</Link>
                            <Link to="/faq" className="text-surface/70 hover:text-primary transition-colors duration-300 font-medium">FAQ</Link>
                            <Link to="/privacy" className="text-surface/70 hover:text-primary transition-colors duration-300 font-medium">Privacy Policy</Link>
                        </div>
                        <div className="border-t border-surface/10 pt-8">
                            <p className="text-surface/60">&copy; {new Date().getFullYear()} Buildora. All Rights Reserved. Sourcing Made Simple, Building Made Easy.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
