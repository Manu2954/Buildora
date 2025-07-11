import React from 'react';
import { Link } from 'react-router-dom';


import { ArrowRight, Star, Zap } from 'lucide-react';


// A simpler, more modern product card for the new homepage design.
const ProductCard = ({ product }) => {
    if (!product) return null;


    const placeholderImage = `https://placehold.co/600x600/f3f4f6/4b5563?text=${encodeURIComponent(product.name)}`;
    const imageUrl = product.images && product.images[0] ? product.images[0] : placeholderImage;

    return (
        <Link to={`/products/${product._id}`} className="flex flex-col text-center group">
            <div className="w-full overflow-hidden bg-gray-100 rounded-lg">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="object-cover w-full h-full transition-transform duration-500 aspect-square group-hover:scale-105"
                    onError={(e) => { e.target.onerror = null; e.target.src = placeholderImage; }}
                />
            </div>
            <h3 className="mt-4 text-base font-bold text-gray-800">{product.name}</h3>
            <p className="mt-1 text-lg font-semibold text-gray-900">
                ₹{product.pricing?.basePrice.toFixed(2)}
            </p>
        </Link>
    );
};

export const ProductCardSkeleton = () => (
    <div className="flex flex-col animate-pulse">
        <div className="w-full bg-gray-200 rounded-lg aspect-square"></div>
        <div className="w-3/4 h-5 mx-auto mt-4 bg-gray-200 rounded"></div>
        <div className="w-1/2 h-6 mx-auto mt-2 bg-gray-200 rounded"></div>

    const placeholderImage = `https://placehold.co/600x400/1a1a1a/667eea?text=${encodeURIComponent(product.name)}`;

    return (
        <div className="group relative glass-card overflow-hidden transition-all duration-500 hover:scale-105 card-hover">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            
            <Link to={`/products/${product._id}`} className="block relative z-10">
                {/* Image Section */}
                <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-gray-900 to-gray-800">
                    <img
                        src={product.images && product.images[0] ? product.images[0] : placeholderImage}
                        alt={product.name}
                        className="object-cover w-full h-48 sm:h-56 transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => { e.target.onerror = null; e.target.src = placeholderImage; }}
                    />
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                        <span className="glass px-3 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-md">
                            {product.category}
                        </span>
                    </div>
                    
                    {/* Featured Badge */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <div className="glass p-2 rounded-full">
                            <Zap size={14} className="text-yellow-400" />
                        </div>
                    </div>
                </div>
                
                {/* Content Section */}
                <div className="p-6 space-y-4">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-white group-hover:text-gradient transition-all duration-300 line-clamp-2">
                        {product.name}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-400 line-clamp-2 group-hover:text-gray-300 transition-colors duration-300">
                        {product.description}
                    </p>
                    
                    {/* Rating */}
                    {product.ratingsAverage > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        size={14} 
                                        className={`${
                                            i < Math.floor(product.ratingsAverage) 
                                                ? 'text-yellow-400 fill-current' 
                                                : 'text-gray-600'
                                        }`} 
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-gray-400">
                                ({product.ratingsQuantity || 0})
                            </span>
                        </div>
                    )}
                    
                    {/* Price Section */}
                    <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-white">
                                ₹{product.pricing?.basePrice.toFixed(2)}
                            </span>
                            {product.pricing?.mrp && (
                                <span className="text-sm text-gray-500 line-through">
                                    ₹{product.pricing.mrp.toFixed(2)}
                                </span>
                            )}
                        </div>
                        
                        {product.pricing?.mrp && (
                            <div className="text-xs text-green-400 font-medium">
                                Save ₹{(product.pricing.mrp - product.pricing.basePrice).toFixed(2)}
                            </div>
                        )}
                    </div>
                    
                    {/* Action Button */}
                    <div className="pt-2">
                        <div className="btn-futuristic w-full flex items-center justify-center gap-2 group-hover:shadow-lg">
                            <span>View Details</span>
                            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export const ProductCardSkeleton = () => ( 
    <div className="glass-card overflow-hidden animate-pulse">
        <div className="w-full h-48 sm:h-56 bg-gradient-to-br from-gray-800 to-gray-700 rounded-t-2xl"></div>
        <div className="p-6 space-y-4">
            <div className="w-1/3 h-4 bg-gray-700 rounded-full"></div>
            <div className="w-3/4 h-6 bg-gray-700 rounded-full"></div>
            <div className="space-y-2">
                <div className="w-full h-4 bg-gray-800 rounded-full"></div>
                <div className="w-5/6 h-4 bg-gray-800 rounded-full"></div>
            </div>
            <div className="w-1/2 h-8 bg-gray-700 rounded-full"></div>
            <div className="w-full h-12 bg-gray-700 rounded-xl"></div>
        </div>

    </div>
);

export default ProductCard;