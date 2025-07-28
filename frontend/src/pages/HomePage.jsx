import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHomePageData } from '../services/storefrontService';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
// import "slick-carousel/slick-theme.css";

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
                // Set empty state on error to prevent crashes
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
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        pauseOnHover: true,
        arrows: true, // Enabled arrows for better navigation on a large banner
    };


    const SectionHeader = ({ title }) => (
        <h2 className="text-3xl font-bold tracking-tight text-center text-gray-900">{title}</h2>
    );

    return (
        <div className="bg-white">
            <main>
                {/* --- Hero Section --- */}
                {/* ✅ FIX: This section is now dedicated entirely to the advertisement slider */}
                <section className="relative w-full overflow-hidden bg-gray-200">
                    {isLoading ? (
                        // Placeholder with a common banner aspect ratio to prevent layout shift
                        <div className="w-full bg-gray-300 aspect-[16/7] animate-pulse"></div>
                    ) : homeData.activeAdvertisements && homeData.activeAdvertisements.length > 0 ? (
                        <Slider {...adSliderSettings}>
                            {homeData.activeAdvertisements.map(ad => (
                                <div key={ad._id}>
                                    {/* The link wraps the entire slide */}
                                    <Link to={ad.linkTo} className="block w-full h-[40vh] md:h-[65vh] bg-gray-800">
                                        <img 
                                            src={ad.imageUrl}
                                            alt={ad.name}
                                            className="object-cover w-full h-full" // Image will cover the link's area
                                        />
                                    </Link>
                                </div>
                            ))}
                        </Slider>
                    ) : (
                        // Fallback to a static image if no active ads, with the same dimensions
                        <div className="w-full h-[40vh] md:h-[65vh]">
                            <img 
                                src={`${process.env.REACT_APP_API_URL}/images/img1.jpg`}
                                alt="Modern interior with green sofa"
                                className="object-cover w-full h-full"
                            />
                        </div>
                    )}
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

                {/* --- Featured Categories Section --- */}
                <section className="py-20 bg-gray-50">
                    <div className="container px-4 mx-auto">
                        <SectionHeader title="Shop by Category" />
                        <div className="grid grid-cols-1 gap-8 mt-12 sm:grid-cols-2 lg:grid-cols-3">
                                 {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>)
                                 ) : (
                                    (homeData.featuredCategories || []).map(category => (
                                        <Link key={category.name} to={`/products?categories=${encodeURIComponent(category.name)}`} className="relative block overflow-hidden rounded-lg shadow-lg group">
                                            <img src={category.image} alt={category.name} className="object-cover w-full h-64 transition-transform duration-500 group-hover:scale-110"/>
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

                {/* --- New Arrivals Section --- */}
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
