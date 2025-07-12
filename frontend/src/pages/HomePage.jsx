import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHomePageData } from '../services/storefrontService';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const HomePage = () => {
     const [homeData, setHomeData] = useState({ featuredCategories: [], bestsellingProducts: [], newArrivals: [], activeAdvertisements: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const data = await getHomePageData();
            setHomeData(data || { featuredCategories: [], bestsellingProducts: [], newArrivals: [], activeAdvertisements: [] });
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const adSliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        pauseOnHover: true,
        arrows: false,
    };


    const SectionHeader = ({ title }) => (
        <h2 className="text-3xl font-bold tracking-tight text-center text-gray-900">{title}</h2>
    );

    return (
        <div className="bg-white">
            <main>
                {/* --- Hero Section --- */}
            <section className="bg-[#333132] text-white">
                    <div className="container grid grid-cols-1 gap-8 px-4 py-20 mx-auto md:grid-cols-2 md:items-center">
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl" style={{fontFamily: "'The Seasons', serif"}}>
                                Modern Building & Design Studio
                            </h1>
                            <p className="max-w-xl mt-6 text-lg text-gray-300">
                                Discover a comprehensive range of institutional supplies, plywood items, and interior design materials. Shop now and build with confidence.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 mt-8 md:justify-start">
                                <Link to="/products" className="px-6 py-3 font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700">Shop Now</Link>
                                <Link to="/products" className="px-6 py-3 font-semibold text-white border-2 border-gray-600 rounded-full hover:bg-gray-700">Explore</Link>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            {/* --- THIS SECTION IS NOW A DYNAMIC SLIDER --- */}
                            <div className="w-full max-w-lg rounded-lg shadow-2xl overflow-hidden">
                                {isLoading ? (
                                     <div className="w-full bg-gray-700 aspect-video animate-pulse"></div>
                                ) : homeData.activeAdvertisements && homeData.activeAdvertisements.length > 0 ? (
                                    <Slider {...adSliderSettings}>
                                        {homeData.activeAdvertisements.map(ad => (
                                            <div key={ad._id}>
                                                <Link to={ad.linkTo} className="block">
                                                    <img 
                                                        src={ad.imageUrl} 
                                                        alt={ad.name}
                                                        className="object-cover w-full"
                                                    />
                                                </Link>
                                            </div>
                                        ))}
                                    </Slider>
                                ) : (
                                    // Fallback to a static image if no active ads
                                    <img 
                                        src={`${process.env.REACT_APP_API_URL}/images/img1.jpg`}
                                        alt="Modern interior with green sofa"
                                        className="object-cover w-full"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* --- Featured Products Section --- */}
                <section className="py-20">
                    <div className="container px-4 mx-auto">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                             <div className="md:col-span-1">
                                <h2 className="text-3xl font-bold text-gray-900">Crafted with excellent material.</h2>
                                <p className="mt-4 text-gray-600">Discover durable and versatile items for all your construction and design needs.</p>
                                <Link to="/products" className="inline-block px-6 py-3 mt-6 font-semibold text-white bg-gray-800 rounded-full hover:bg-gray-900">Explore</Link>
                            </div>
                            <div className="grid grid-cols-1 gap-8 md:col-span-2 sm:grid-cols-2 lg:grid-cols-3">
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={i} />)
                                ) : (
                                    (homeData.bestsellingProducts || []).slice(0, 3).map(product => (
                                        <ProductCard key={product._id} product={product} />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* You can add more sections here following the same pattern */}
                {/* --- NEW: Featured Categories Section --- */}
                <section className="py-20 bg-gray-50">
                    <div className="container px-4 mx-auto">
                        <SectionHeader title="Shop by Category" />
                        <div className="grid grid-cols-1 gap-8 mt-12 sm:grid-cols-2 lg:grid-cols-3">
                             {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>)
                             ) : (
                                (homeData.featuredCategories || []).map(category => (
                                    <Link key={category.name} to={`/products?categories=${encodeURIComponent(category.name)}`} className="relative block overflow-hidden rounded-lg shadow-lg group">
                                        <img src={`${process.env.REACT_APP_API_URL}${category.image}`} alt={category.name} className="object-cover w-full h-64 transition-transform duration-500 group-hover:scale-110"/>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <div className="absolute bottom-0 p-6">
                                            <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                                        </div>
                                    </Link>
                                ))
                             )}
                        </div>
                    </div>
                </section>

                {/* --- NEW: New Arrivals Section --- */}
                <section className="py-20">
                    <div className="container px-4 mx-auto">
                        <SectionHeader title="New Arrivals" />
                        <div className="grid grid-cols-1 gap-6 mt-12 sm:grid-cols-2 lg:grid-cols-4">
                             {isLoading ? (
                                 Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                             ) : (
                                 (homeData.newArrivals || []).slice(0,4).map(product => (
                                    <ProductCard key={product._id} product={product} />
                                ))
                             )}
                        </div>
                    </div>
                </section>                
            </main>
            
            {/* Footer Section */}
            <footer className="py-20 text-gray-500 bg-gray-100 border-t">
                <div className="container px-4 mx-auto text-center">
                    <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
                        <Link to="/about" className="text-sm hover:text-indigo-600">About Us</Link>
                        <Link to="/contact" className="text-sm hover:text-indigo-600">Contact</Link>
                        <Link to="/faq" className="text-sm hover:text-indigo-600">FAQ</Link>
                        <Link to="/privacy" className="text-sm hover:text-indigo-600">Privacy Policy</Link>
                    </div>
                    <p>&copy; {new Date().getFullYear()} Buildora. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
