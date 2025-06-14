import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag } from 'lucide-react';

const ProductCard = ({ product }) => {
    if (!product) return null;

    const placeholderImage = `https://placehold.co/600x400/e2e8f0/475569?text=${encodeURIComponent(product.name)}`;

    return (
        <div className="relative flex flex-col overflow-hidden transition-transform duration-300 ease-in-out bg-white border border-gray-200 rounded-lg shadow-sm group hover:-translate-y-1 hover:shadow-lg">
            <Link to={`/products/${product._id}`} className="block">
                {/* The aspect-w-1 aspect-h-1 classes create a square container */}
                <div className="overflow-hidden aspect-w-1 aspect-h-1 bg-gray-50">
                    <img
                        src={product.images && product.images[0] ? product.images[0] : placeholderImage}
                        alt={product.name}
                        // --- THE FIX IS HERE ---
                        // Changed from object-cover to object-contain and added padding.
                        className="object-contain w-full h-full p-2 transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { e.target.onerror = null; e.target.src = placeholderImage; }}
                    />
                </div>
                <div className="flex flex-col flex-grow p-4">
                    <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">{product.category}</p>
                    <h3 className="mt-1 text-lg font-bold text-gray-800 truncate">{product.name}</h3>
                    <p className="flex-grow mt-2 text-sm text-gray-600 line-clamp-2">{product.description}</p>
                    
                    <div className="mt-4">
                        <span className="text-2xl font-extrabold text-gray-900">
                            ₹{product.pricing?.basePrice.toFixed(2)}
                        </span>
                        {product.pricing?.mrp && (
                            <span className="ml-2 text-sm text-gray-500 line-through">
                                ₹{product.pricing.mrp.toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
            </Link>
            <div className="p-4 pt-0 mt-auto">
                 <Link to={`/products/${product._id}`} className="inline-flex items-center justify-center w-full px-4 py-2 font-semibold text-white transition-colors duration-300 bg-indigo-600 rounded-md group-hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    View Details
                    <ArrowRight size={16} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
            </div>
        </div>
    );
};

// Skeleton loader for the product card
export const ProductCardSkeleton = () => (
    <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm animate-pulse">
        <div className="w-full h-48 bg-gray-300"></div>
        <div className="p-4">
            <div className="w-1/3 h-4 bg-gray-300 rounded"></div>
            <div className="w-3/4 h-6 mt-2 bg-gray-300 rounded"></div>
            <div className="w-full h-4 mt-3 bg-gray-200 rounded"></div>
            <div className="w-5/6 h-4 mt-1 bg-gray-200 rounded"></div>
            <div className="w-1/2 h-8 mt-4 bg-gray-300 rounded"></div>
        </div>
        <div className="p-4 pt-0 mt-auto">
            <div className="w-full h-10 bg-gray-300 rounded-md"></div>
        </div>
    </div>
);

export default ProductCard;
