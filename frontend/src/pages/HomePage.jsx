import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHomePageData } from '../services/storefrontService';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { ArrowRight, Truck, ShieldCheck, Award } from 'lucide-react';

const HomePage = () => {
    const [homeData, setHomeData] = useState({ featuredCategories: [], bestsellingProducts: [] });
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

    const HeroSection = () => (
        <div className="relative pt-16 pb-32 overflow-hidden text-center bg-gray-900">
            {/* Placeholder for a background GIF or video */}
            <div className="absolute inset-0">
                 <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="object-cover w-full h-full opacity-30"
                >
                    {/* The src now points directly to the file served by the backend */}
                    {/* Make sure your video is an .mp4 or .webm file, not .mp3 */}
                    <source src="/videos/vid1.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
            <div className="relative container mx-auto px-4">
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
                    Buildora
                </h1>
                <p className="max-w-2xl mx-auto mt-6 text-xl text-gray-300">
                    Everything You Need. Everywhere You Build.
                </p>
                <div className="mt-10">
                    <Link to="/products" className="px-8 py-3 font-semibold text-white transition-transform duration-300 bg-indigo-600 rounded-md hover:bg-indigo-700 hover:scale-105">
                        Shop All Products
                    </Link>
                </div>
            </div>
        </div>
    );
    
    const CategoryCard = ({ category }) => (
        <Link to={`/products?categories=${category.name}`} className="relative block overflow-hidden rounded-lg shadow-lg group">
            <img src={category.image} alt={category.name} className="object-cover w-full h-64 transition-transform duration-500 group-hover:scale-110"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 p-6">
                <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                <span className="inline-flex items-center mt-2 text-sm font-semibold text-white transition-all duration-300 group-hover:text-indigo-300">
                    Explore <ArrowRight size={16} className="ml-1"/>
                </span>
            </div>
        </Link>
    );

    return (
        <div className="bg-white">
            <HeroSection />

            {/* Featured Categories Section */}
            <section className="py-16 bg-gray-50">
                <div className="container px-4 mx-auto">
                     <h2 className="mb-8 text-3xl font-bold text-center text-gray-800">Shop by Category</h2>
                     <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                         {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>)
                         ) : (
                            homeData.featuredCategories.map(category => (
                                <CategoryCard key={category.name} category={category} />
                            ))
                         )}
                     </div>
                </div>
            </section>
            
            {/* Value Propositions Section */}
            <section className="py-16 bg-white">
                 <div className="container px-4 mx-auto">
                     <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
                        <div className="p-4"><Truck size={48} className="mx-auto text-indigo-600"/> <h3 className="mt-4 text-lg font-semibold">Fast & Reliable Shipping</h3><p className="mt-1 text-gray-600">Get your materials delivered on-site, on time.</p></div>
                        <div className="p-4"><ShieldCheck size={48} className="mx-auto text-indigo-600"/> <h3 className="mt-4 text-lg font-semibold">Secure Payments</h3><p className="mt-1 text-gray-600">Your transactions are safe with our secure payment gateway.</p></div>
                        <div className="p-4"><Award size={48} className="mx-auto text-indigo-600"/> <h3 className="mt-4 text-lg font-semibold">Quality Guaranteed</h3><p className="mt-1 text-gray-600">We source only the best materials from trusted companies.</p></div>
                     </div>
                 </div>
            </section>


            {/* Bestsellers Section */}
            <section className="py-16 bg-gray-50">
                 <div className="container px-4 mx-auto">
                    <h2 className="mb-8 text-3xl font-bold text-center text-gray-800">Proven Bestsellers</h2>
                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                         {isLoading ? (
                             Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)
                         ) : (
                             homeData.bestsellingProducts.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))
                         )}
                     </div>
                 </div>
            </section>
            
            {/* Footer Section - This can be moved to a separate component later */}
            <footer className="py-12 text-white bg-gray-800">
                <div className="container px-4 mx-auto text-center">
                    <p>&copy; {new Date().getFullYear()} Buildora. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
