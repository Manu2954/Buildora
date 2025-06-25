import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHomePageData } from '../services/storefrontService';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { ArrowRight, Truck, ShieldCheck, Award } from 'lucide-react';

// A reusable component for the promotional cards at the top of the page
const PromoCard = ({ title, description, imageUrl, linkTo }) => (
    <Link to={linkTo} className="flex flex-col gap-4 group">
        <div className="overflow-hidden rounded-xl">
            <img 
                src={imageUrl} 
                alt={title} 
                className="w-full bg-center bg-no-repeat aspect-video bg-cover transition-transform duration-500 group-hover:scale-105" 
                onError={(e) => { e.target.src = 'https://placehold.co/600x400/e2e8f0/475569?text=Promotion'; }}
            />
        </div>
        <div>
            <p className="text-lg font-bold text-gray-900">{title}</p>
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{description}</p>
        </div>
    </Link>
);

// A reusable component for the large featured category cards
const FeaturedCategoryCard = ({ category }) => (
    <Link to={`/products?categories=${encodeURIComponent(category.name)}`} key={category.name} className="relative block overflow-hidden rounded-xl group">
        <img src={category.image} alt={category.name} className="object-cover w-full h-80 transition-transform duration-500 group-hover:scale-105"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 p-8">
            <h3 className="text-3xl font-bold text-white">{category.name}</h3>
            <p className="max-w-md mt-1 text-gray-200">Explore a wide array of materials to enhance your projects.</p>
        </div>
    </Link>
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
        <div className="bg-white">
            <main>
                {/* Top Promotional Section - White Background */}
                <section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        <PromoCard 
                            title="Everything You Need. Everywhere You Build."
                            description="Discover a comprehensive range of institutional supplies, plywood items, and interior design materials. Shop now and build with confidence."
                            imageUrl="/images/interior.png"
                            linkTo="/products"
                        />
                        <PromoCard 
                            title="Sourcing Made Simple. Building Made Easy."
                            description="Simplify your sourcing and streamline your building process with our curated selection of high-quality materials."
                            imageUrl="/images/school.png"
                            linkTo="/products"
                        />
                    </div>
                </section>

                {/* Featured Categories Section - Light Gray Background for separation */}
                <section className="py-20 bg-gray-50">
                    <div className="container px-4 mx-auto max-w-7xl">
                        <h2 className="text-3xl font-bold tracking-tight text-center text-gray-900">Featured Categories</h2>
                        <div className="grid grid-cols-1 gap-8 mt-12 md:grid-cols-2">
                            {isLoading ? (
                                Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-80 bg-gray-200 rounded-xl animate-pulse"></div>)
                            ) : (
                                (homeData.featuredCategories.slice(0, 2) || []).map(category => (
                                    <FeaturedCategoryCard key={category.name} category={category} />
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* New Arrivals Section - White Background */}
                <section className="py-20">
                    <div className="container px-4 mx-auto max-w-7xl">
                        <h2 className="text-3xl font-bold tracking-tight text-center text-gray-900">New Arrivals</h2>
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

                {/* Customer Favorites / Bestsellers Section - Light Gray Background */}
                <section className="py-20 bg-gray-50">
                     <div className="container px-4 mx-auto max-w-7xl">
                        <h2 className="text-3xl font-bold tracking-tight text-center text-gray-900">Customer Favorites</h2>
                        <div className="grid grid-cols-1 gap-6 mt-12 sm:grid-cols-2 lg:grid-cols-4">
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                            ) : (
                                (homeData.bestsellingProducts || []).slice(0,4).map(product => (
                                    <ProductCard key={product._id} product={product} />
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* Newsletter Section */}
                <section className="py-20">
                    <div className="max-w-4xl px-6 py-16 mx-auto text-center bg-indigo-700 rounded-2xl">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Join Our Community</h2>
                        <p className="max-w-xl mx-auto mt-4 text-lg text-indigo-200">Stay updated on the latest products, exclusive offers, and building tips. Sign up for our newsletter today.</p>
                        <form className="flex justify-center max-w-sm mx-auto mt-8">
                            <input type="email" placeholder="Enter your email" className="w-full px-4 py-3 border-gray-300 rounded-l-md focus:ring-indigo-500"/>
                            <button type="submit" className="px-6 py-3 font-semibold text-white bg-indigo-500 rounded-r-md hover:bg-indigo-400">Subscribe</button>
                        </form>
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
