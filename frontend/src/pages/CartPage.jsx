import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Plus, Minus, X, ShoppingCart, ArrowRight } from 'lucide-react';

const CartPage = () => {
    const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();

    if (cart.items.length === 0) {
        return (
            <div className="container px-4 py-24 mx-auto text-center">
                <ShoppingCart size={64} className="mx-auto text-gray-300" />
                <h1 className="mt-6 text-2xl font-bold text-gray-800">Your Shopping Cart is Empty</h1>
                <p className="mt-2 text-gray-600">Looks like you haven't added anything to your cart yet.</p>
                <Link
                    to="/products"
                    className="inline-flex items-center justify-center px-6 py-3 mt-8 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container px-4 py-12 mx-auto">
                <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-gray-900">Your Cart</h1>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Cart Items */}
                    <div className="space-y-4 lg:col-span-2">
                        {cart.items.map(item => (
                            <div key={item.cartItemId} className="flex p-4 bg-white border rounded-lg shadow-sm">
                                <img
                                    src={item.image || `https://placehold.co/100x100/e2e8f0/475569?text=${item.name}`}
                                    alt={item.name}
                                    className="object-cover w-24 h-24 border rounded-md"
                                />
                                <div className="flex flex-col flex-grow ml-4">
                                    <Link to={`/products/${item._id}`} className="font-bold text-gray-800 hover:text-indigo-600">{item.name}</Link>
                                    {/* Display variant name if it exists */}
                                    {item.variant && <p className="text-sm text-gray-500">{item.variant.name} {item.variant.unit && `(${item.variant.unit})`}</p>}
                                    <p className="mt-1 text-lg font-semibold text-gray-900">₹{item.price.toFixed(2)}</p>
                                    <div className="flex items-center mt-auto">
                                        <div className="flex items-center border border-gray-300 rounded-md">
                                            <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} disabled={item.quantity <= 1} className="px-2 py-1 disabled:opacity-50"><Minus size={14} /></button>
                                            <span className="w-10 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="px-2 py-1"><Plus size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => removeFromCart(item.cartItemId)} className="self-start p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-red-600">
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                        <button onClick={clearCart} className="text-sm font-medium text-red-600 hover:text-red-800">Clear Cart</button>
                    </div>
                    {/* Order Summary */}
                    <div className="p-6 bg-white border rounded-lg shadow-sm lg:col-span-1 h-fit">
                        <h2 className="pb-4 text-xl font-bold text-gray-800 border-b">Order Summary</h2>
                        <div className="py-4 space-y-2 text-sm text-gray-600 border-b">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>₹{cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span className="font-semibold text-green-600">FREE</span>
                            </div>
                        </div>
                        <div className="flex justify-between py-4 font-bold text-gray-800">
                            <span>Total</span>
                            <span>₹{cartTotal.toFixed(2)}</span>
                        </div>
                        <Link
                            to="/checkout"
                            className="flex items-center justify-center w-full px-6 py-3 mt-4 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                        >
                            Proceed to Checkout <ArrowRight size={20} className="ml-2" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
