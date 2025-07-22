import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    getProductById,
    getRelatedProducts,
} from "../services/storefrontService";
import { createReview } from "../services/reviewService";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import {
    Star,
    Minus,
    Plus,
    ShoppingCart,
    AlertTriangle,
    ChevronRight,
    Building,
    Lock,
    RefreshCw,
    Truck,
    MessageSquare,
} from "lucide-react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Skeleton Loader for a professional loading state
const ProductDetailSkeleton = () => (
    <div className="container px-4 py-12 mx-auto animate-pulse">
        <div className="w-1/3 h-4 mb-8 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Image Column */}
            <div className="lg:col-span-1">
                <div className="w-full h-96 bg-gray-300 rounded-lg"></div>
                <div className="flex mt-4 space-x-2">
                    <div className="w-20 h-20 bg-gray-300 rounded-md"></div>
                    <div className="w-20 h-20 bg-gray-300 rounded-md"></div>
                    <div className="w-20 h-20 bg-gray-300 rounded-md"></div>
                </div>
            </div>
            {/* Details Column */}
            <div className="lg:col-span-1">
                <div className="w-3/4 h-8 bg-gray-300 rounded"></div>
                <div className="w-1/4 h-6 mt-4 bg-gray-200 rounded"></div>
                <div className="w-1/3 h-4 mt-4 bg-gray-200 rounded"></div>
                <hr className="my-6" />
                <div className="w-1/2 h-10 mt-4 bg-gray-300 rounded"></div>
                <div className="w-full h-20 mt-6 bg-gray-200 rounded"></div>
            </div>
            {/* Buy Box Column */}
            <div className="lg:col-span-1">
                <div className="w-full h-64 p-4 border rounded-lg bg-gray-200">
                    <div className="w-1/2 h-8 bg-gray-300 rounded"></div>
                    <div className="w-full h-12 mt-8 bg-gray-300 rounded-md"></div>
                    <div className="w-full h-12 mt-4 bg-gray-300 rounded-md"></div>
                </div>
            </div>
        </div>
    </div>
);

// Reusable Star Rating component
const StarRating = ({ rating = 0, onRatingChange, readOnly = false }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => {
            const ratingValue = i + 1;
            return (
                <button
                    key={i}
                    type="button"
                    disabled={readOnly}
                    onClick={() => !readOnly && onRatingChange(ratingValue)}
                    className={`transition-transform duration-200 ${!readOnly ? "hover:scale-125" : ""
                        }`}
                >
                    <Star
                        size={20}
                        className={
                            ratingValue <= rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                        }
                    />
                </button>
            );
        })}
    </div>
);

const ReviewForm = ({ productId, onReviewSubmitted }) => {
    const { token } = useAuth();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0 || !comment.trim()) {
            setError("Please provide a rating and a comment.");
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            await createReview(productId, { rating, comment }, token);
            setRating(0);
            setComment("");
            onReviewSubmitted(); // Notify parent to refetch product data
        } catch (err) {
            setError(err.message || "Failed to submit review.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 mt-8 bg-gray-50 border rounded-lg">
            <h3 className="text-lg font-bold">Write a review</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Your Rating
                    </label>
                    <StarRating rating={rating} onRatingChange={setRating} />
                </div>
                <div>
                    <label
                        htmlFor="comment"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Your Review
                    </label>
                    <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows="4"
                        className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                        required
                    ></textarea>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="text-right">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                    >
                        {isLoading ? "Submitting..." : "Submit Review"}
                    </button>
                </div>
            </form>
        </div>
    );
};

const ProductDetailPage = () => {
    const { productId } = useParams();
    const { addToCart } = useCart();
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    const fetchProductData = async () => {
        setIsLoading(true);
        setError("");
        window.scrollTo(0, 0);
        try {
            const mainProductData = await getProductById(productId);
            setProduct(mainProductData);

            if (mainProductData.variants?.length > 0) {
                const defaultVariant =
                    mainProductData.variants.find((v) => v.stock > 0) ||
                    mainProductData.variants[0];
                setSelectedVariant(defaultVariant);
            }

            if (mainProductData) {
                const relatedData = await getRelatedProducts(
                    mainProductData._id,
                    mainProductData.category
                );
                setRelatedProducts(relatedData);
            }
        } catch (err) {
            setError(err.message || "Product not found.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProductData();
    }, [productId]);

    useEffect(() => {
        setQuantity(1);
        setSelectedImageIndex(0);
    }, [selectedVariant]);

    const handleQuantityChange = (amount) => {
        const maxQuantity = selectedVariant ? selectedVariant.stock : 0;
        const newQuantity = quantity + amount;
        if (newQuantity >= 1 && newQuantity <= maxQuantity) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = () => {
        if (!product || !selectedVariant) return;

        const mainImage = selectedVariant.images?.length ? selectedVariant.images[0] : `https://placehold.co/100x100?text=No+Image`;

        const itemToAdd = {
            _id: product._id,
            name: product.name,
            companyName: product.companyName,
            image: mainImage,
            variant: {
                _id: selectedVariant._id,
                name: selectedVariant.name,
                price: selectedVariant.pricing.ourPrice,
                sku: selectedVariant.sku,
            },
            price: selectedVariant.pricing.ourPrice,
        };

        setIsAdding(true);
        addToCart(itemToAdd, quantity);
        setTimeout(() => setIsAdding(false), 1000);
    };

    if (isLoading) return <ProductDetailSkeleton />;

    if (error)
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center text-red-700">
                <AlertTriangle size={48} className="mb-4" />
                <h3 className="text-xl font-semibold">An Error Occurred</h3>
                <p>{error}</p>
                <Link
                    to="/products"
                    className="px-4 py-2 mt-6 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                    Back to Products
                </Link>
            </div>
        );

    if (!product) return null;

    const displayVariant = selectedVariant || (product.variants && product.variants[0]) || {};
    const images = displayVariant.images?.length ? displayVariant.images : [`https://placehold.co/800x600/e2e8f0/475569?text=${encodeURIComponent(product.name)}`];
    const displayPrice = displayVariant.pricing?.ourPrice || 0;
    const displayMrp = displayVariant.pricing?.mrp;
    const stock = displayVariant.stock || 0;
    const attributes = displayVariant.attributes || [];
    const dimensions = displayVariant.dimensions;
    const weight = displayVariant.weight;

    const hasUserReviewed = product.reviews?.some(
        (review) => review.user === user?._id
    );

    const stockStatus =
        stock > 10 ? (
            <p className="mt-2 text-lg font-semibold text-green-600">In Stock</p>
        ) : stock > 0 ? (
            <p className="mt-2 text-lg font-semibold text-orange-500">
                Only {stock} left - order soon!
            </p>
        ) : (
            <p className="mt-2 text-lg font-semibold text-red-600">Out of Stock</p>
        );

    const carouselSettings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 4,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 3 } },
            { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
        ],
    };

    return (
        <div className="bg-white">
            <div className="container px-4 py-8 mx-auto">
                <nav className="flex items-center mb-6 text-sm text-gray-500">
                    <Link to="/products" className="hover:text-indigo-600">
                        Products
                    </Link>
                    <ChevronRight size={16} className="mx-2" />
                    <span className="font-semibold text-gray-700">
                        {product.category}
                    </span>
                </nav>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* LEFT COLUMN: Image Gallery */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <div className="mb-4 overflow-hidden border border-gray-200 rounded-lg">
                                <img
                                    src={`${process.env.REACT_APP_API_URL}${images[selectedImageIndex]}`}
                                    alt={product.name}
                                    className="object-contain w-full h-auto"
                                    onError={(e) => { e.target.src = `https://placehold.co/800x600/e2e8f0/475569?text=Image+Error`; }}
                                />
                            </div>
                            <div className="flex -m-1">
                                {images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`w-20 h-20 p-1 m-1 overflow-hidden border rounded-md ${selectedImageIndex === index
                                            ? "border-indigo-500 ring-2 ring-indigo-200"
                                            : "border-gray-200"
                                            }`}
                                    >
                                        <img
                                            src={`${process.env.REACT_APP_API_URL}${img}`}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="object-contain w-full h-full"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE COLUMN: Product Info */}
                    <div className="lg:col-span-1">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 lg:text-3xl">
                            {product.name}
                        </h1>
                        <Link
                            to={`/company/${product.companyId}`}
                            className="mt-1 text-sm font-medium text-indigo-600 hover:underline"
                        >
                            Sold by: {product.companyName}
                        </Link>
                        <div className="mt-3">
                            <StarRating rating={product.ratingsAverage} readOnly />
                        </div>
                        <hr className="my-6" />
                        <div>
                            <span className="text-sm font-semibold text-red-600">
                                Limited time deal
                            </span>
                            <div className="flex items-baseline mt-1">
                                <span className="text-3xl font-bold text-gray-900">
                                    ₹{displayPrice.toFixed(2)}
                                </span>
                                {displayMrp && (
                                    <div className="ml-3 text-gray-500">
                                        <span className="text-sm">M.R.P: </span>
                                        <span className="text-sm line-through">
                                            ₹{displayMrp.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <p className="mt-1 text-sm text-gray-600">
                                Inclusive of all taxes
                            </p>
                        </div>
                        {product.variants && product.variants.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-semibold text-gray-900">
                                    {selectedVariant?.name ? `Selected: ${selectedVariant.name}` : "Select an Option"}
                                </h3>
                                <div className="flex flex-wrap gap-3 mt-4">
                                    {product.variants.map((variant) => (
                                        <button
                                            key={variant._id}
                                            onClick={() => setSelectedVariant(variant)}
                                            disabled={variant.stock === 0}
                                            className={`relative px-4 py-2 text-sm font-medium border rounded-lg transition-all duration-200 ${selectedVariant?._id === variant._id
                                                ? "bg-indigo-600 text-white border-indigo-600 ring-2 ring-offset-2 ring-indigo-500"
                                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                                } ${variant.stock === 0
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border-dashed"
                                                    : ""
                                                }`}
                                        >
                                            {variant.name}
                                            {variant.stock === 0 && (
                                                <span className="absolute top-0 right-0 px-1 text-xs text-white bg-red-500 rounded-full -translate-y-1/2 translate-x-1/3">
                                                    Out
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="mt-8">
                            <h3 className="text-base font-semibold text-gray-900">
                                About this item
                            </h3>
                            <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                                {product.description}
                            </p>
                        </div>
                        <div className="mt-8">
                            <h3 className="text-base font-semibold text-gray-900">
                                Product Information
                            </h3>
                            <table className="w-full mt-2 text-sm text-left text-gray-700">
                                <tbody>
                                    <tr className="border-b"><td className="py-2 font-medium text-gray-500">Brand</td><td className="py-2">{product.companyName}</td></tr>
                                    <tr className="border-b"><td className="py-2 font-medium text-gray-500">Category</td><td className="py-2">{product.category}</td></tr>
                                    {attributes.map((attr) => (<tr key={attr.name} className="border-b"><td className="py-2 font-medium text-gray-500">{attr.name}</td><td className="py-2">{attr.value}</td></tr>))}
                                    {dimensions && (dimensions.length || dimensions.width || dimensions.height) && (<tr className="border-b"><td className="py-2 font-medium text-gray-500">Dimensions</td><td className="py-2">{`${dimensions.length || 'N/A'} x ${dimensions.width || 'N/A'} x ${dimensions.height || 'N/A'} ${dimensions.unit || ''}`}</td></tr>)}
                                    {weight?.value && (<tr className="border-b"><td className="py-2 font-medium text-gray-500">Weight</td><td className="py-2">{`${weight.value} ${weight.unit}`}</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Buy Box */}
                    <div className="lg:col-span-1">
                        <div className="p-4 border border-gray-200 rounded-lg shadow-sm sticky top-24">
                            <p className="text-3xl font-bold text-gray-900">₹{displayPrice.toFixed(2)}</p>
                            {stockStatus}
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700">Quantity:</p>
                                <div className="flex items-center border border-gray-300 rounded-md w-fit mt-1">
                                    <button onClick={() => handleQuantityChange(-1)} className="px-3 py-1 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" disabled={quantity <= 1}><Minus size={16} /></button>
                                    <span className="w-12 text-center font-semibold text-gray-900">{quantity}</span>
                                    <button onClick={() => handleQuantityChange(1)} className="px-3 py-1 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" disabled={quantity >= stock}><Plus size={16} /></button>
                                </div>
                            </div>
                            <button onClick={handleAddToCart} disabled={isAdding || stock === 0} className="flex items-center justify-center w-full px-8 py-3 mt-6 text-base font-medium text-black bg-yellow-400 border border-transparent rounded-full hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed">
                                {isAdding ? "Adding..." : "Add to Cart"}
                            </button>
                            <button disabled={stock === 0} className="flex items-center justify-center w-full px-8 py-3 mt-3 text-base font-medium text-black bg-orange-400 border border-transparent rounded-full hover:bg-orange-500 disabled:bg-gray-300 disabled:cursor-not-allowed">
                                Buy Now
                            </button>
                            <div className="mt-4 space-y-2 text-sm text-gray-600">
                                <div className="flex items-center"><RefreshCw size={16} className="mr-2" /> <span>7 days Replacement</span></div>
                                <div className="flex items-center"><Truck size={16} className="mr-2" /> <span>Buildora Delivered</span></div>
                                <div className="flex items-center"><Lock size={16} className="mr-2" /> <span>Secure transaction</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-16 mt-16 border-t">
                    {/* Related Products Section */}
                    {relatedProducts.length > 0 && (
                        <section>
                            <h2 className="mb-6 text-2xl font-bold text-gray-900">Products related to this item</h2>
                            <Slider {...carouselSettings}>
                                {relatedProducts.map((related) => (<div key={related._id} className="px-2"><ProductCard product={related} /></div>))}
                            </Slider>
                        </section>
                    )}

                    {/* Customer Reviews Section */}
                    <section className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900">Customer reviews</h2>
                        {product.reviews && product.reviews.length > 0 ? (
                            <>
                                <div className="flex items-center gap-4 p-4 mt-6 bg-gray-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        <p className="text-4xl font-bold">{product.ratingsAverage.toFixed(1)}</p>
                                        <StarRating rating={product.ratingsAverage} readOnly />
                                        <p className="text-sm text-gray-600">Based on {product.ratingsQuantity} reviews</p>
                                    </div>
                                </div>
                                <div className="mt-8 space-y-8">
                                    {product.reviews.map((review) => (
                                        <div key={review._id} className="flex gap-4">
                                            <div className="flex items-center justify-center w-12 h-12 text-lg font-bold text-white bg-indigo-500 rounded-full shrink-0">
                                                {review.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold">{review.name}</h4>
                                                <div className="flex items-center mt-1"><StarRating rating={review.rating} readOnly /></div>
                                                <p className="mt-2 text-gray-700">{review.comment}</p>
                                                <p className="mt-2 text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (<p className="mt-4 text-gray-600">No reviews yet. Be the first to write one!</p>)}
                        {isAuthenticated && !hasUserReviewed && (<ReviewForm productId={product._id} onReviewSubmitted={fetchProductData} />)}
                        {isAuthenticated && hasUserReviewed && (<p className="p-4 mt-4 text-sm text-blue-700 bg-blue-50 rounded-md">You've already reviewed this product.</p>)}
                        {!isAuthenticated && (<p className="p-4 mt-4 text-sm text-gray-700 bg-gray-100 rounded-md"><Link to="/login" className="font-semibold text-indigo-600 hover:underline">Log in</Link> to write a review.</p>)}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
