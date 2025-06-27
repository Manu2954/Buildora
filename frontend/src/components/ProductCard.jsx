import React from 'react';
import { Link } from 'react-router-dom';

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
    </div>
);

export default ProductCard;
