import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    // Basic validation: if no product or no variants, don't render.
    if (!product || !product.variants || product.variants.length === 0) {
        return null;
    }

    // ✅ FIX: The component now directly uses the product's top-level properties
    // and gets display-specific details from the first variant.
    const displayVariant = product.variants[0];

    // If for some reason the first variant is missing, we still don't render.
    if (!displayVariant) {
        return null;
    }

    const placeholderImage = `https://placehold.co/600x600/f3f4f6/4b5563?text=${encodeURIComponent(product.name)}`;
    
    // Get image from the first variant.
    const imageUrl = displayVariant.images?.[0] || placeholderImage;
    
    // Get price from the first variant's pricing object.
    const displayPrice = displayVariant.pricing?.ourPrice;

    // Don't render a card if the price is missing.
    if (displayPrice === undefined || displayPrice === null) {
        return null;
    }

    return (
        <Link to={`/products/${product._id}`} className="flex flex-col text-center group">
            <div className="w-full overflow-hidden bg-background rounded-lg">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="object-cover w-full h-full transition-transform duration-500 aspect-square group-hover:scale-105"
                    onError={(e) => { e.target.onerror = null; e.target.src = placeholderImage; }}
                />
            </div>
            <h3 className="mt-4 text-base font-bold text-text">{product.name}</h3>
            <p className="mt-1 text-lg font-semibold text-text">
                ₹{displayPrice.toFixed(2)}
            </p>
        </Link>
    );
};

export const ProductCardSkeleton = () => (
    <div className="flex flex-col animate-pulse">
        <div className="w-full bg-border rounded-lg aspect-square"></div>
        <div className="w-3/4 h-5 mx-auto mt-4 bg-border rounded"></div>
        <div className="w-1/2 h-6 mx-auto mt-2 bg-border rounded"></div>
    </div>
);

export default ProductCard;
