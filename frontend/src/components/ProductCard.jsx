import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart } from 'lucide-react';

const ProductCard = ({ product }) => {
    // Basic validation: if no product or no variants, don't render.
    if (!product || !product.variants || product.variants.length === 0) {
        return null;
    }

    const displayVariant = product.variants[0];

    if (!displayVariant) {
        return null;
    }

    const placeholderImage = `https://placehold.co/600x600/f3f4f6/4b5563?text=${encodeURIComponent(product.name)}`;
    
    const imageUrl = displayVariant.images?.[0] || placeholderImage;
    const displayPrice = displayVariant.pricing?.ourPrice;

    if (displayPrice === undefined || displayPrice === null) {
        return null;
    }

    // Mock rating for demo purposes (in real app, this would come from the product data)
    const rating = 4.5;
    const reviewCount = Math.floor(Math.random() * 50) + 10;

    return (
        <div className="group relative bg-surface rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-border/50 hover:border-primary/20">
            {/* Product Image Container */}
            <Link to={`/products/${product._id}`} className="block relative overflow-hidden rounded-t-2xl">
                <div className="relative aspect-square overflow-hidden bg-background">
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="object-cover w-full h-full transition-all duration-700 group-hover:scale-110"
                        onError={(e) => { e.target.onerror = null; e.target.src = placeholderImage; }}
                    />
                    {/* Overlay gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Floating action buttons */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                        <button className="flex items-center justify-center w-10 h-10 bg-surface/90 backdrop-blur-sm hover:bg-primary hover:text-white text-text rounded-full shadow-lg transition-all duration-300 hover:scale-110">
                            <Heart size={18} />
                        </button>
                        <button className="flex items-center justify-center w-10 h-10 bg-surface/90 backdrop-blur-sm hover:bg-primary hover:text-white text-text rounded-full shadow-lg transition-all duration-300 hover:scale-110">
                            <ShoppingCart size={18} />
                        </button>
                    </div>

                    {/* Stock badge */}
                    <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center px-3 py-1 bg-success text-white text-xs font-semibold rounded-full">
                            In Stock
                        </span>
                    </div>
                </div>
            </Link>

            {/* Product Info */}
            <div className="p-6">
                <Link to={`/products/${product._id}`} className="block">
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star 
                                    key={i} 
                                    size={14} 
                                    className={`${i < Math.floor(rating) ? 'text-warning fill-current' : 'text-border'}`}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-muted">({reviewCount})</span>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-bold text-text mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight">
                        {product.name}
                    </h3>

                    {/* Product Description */}
                    {product.description && (
                        <p className="text-sm text-muted mb-4 line-clamp-2 leading-relaxed">
                            {product.description}
                        </p>
                    )}

                    {/* Price Section */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-text">
                                ₹{displayPrice.toLocaleString('en-IN')}
                            </span>
                            {displayVariant.pricing?.mrp && displayVariant.pricing.mrp > displayPrice && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted line-through">
                                        ₹{displayVariant.pricing.mrp.toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-xs font-semibold text-success bg-success/10 px-2 py-1 rounded-full">
                                        {Math.round(((displayVariant.pricing.mrp - displayPrice) / displayVariant.pricing.mrp) * 100)}% OFF
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        {/* Quick add button */}
                        <button className="flex items-center justify-center w-12 h-12 bg-primary hover:bg-primary-hover text-white rounded-full transition-all duration-300 hover:scale-105 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
                            <ShoppingCart size={20} />
                        </button>
                    </div>
                </Link>
            </div>

            {/* Hover border effect */}
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/20 transition-all duration-300 pointer-events-none"></div>
        </div>
    );
};

export const ProductCardSkeleton = () => (
    <div className="bg-surface rounded-2xl shadow-md overflow-hidden border border-border/50 animate-pulse">
        <div className="aspect-square bg-border/30"></div>
        <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-3 h-3 bg-border/30 rounded-full"></div>
                    ))}
                </div>
                <div className="w-8 h-3 bg-border/30 rounded"></div>
            </div>
            <div className="w-3/4 h-5 bg-border/30 rounded mb-2"></div>
            <div className="w-full h-4 bg-border/30 rounded mb-4"></div>
            <div className="flex items-center justify-between">
                <div>
                    <div className="w-20 h-7 bg-border/30 rounded mb-1"></div>
                    <div className="w-16 h-4 bg-border/30 rounded"></div>
                </div>
                <div className="w-12 h-12 bg-border/30 rounded-full"></div>
            </div>
        </div>
    </div>
);

export default ProductCard;
