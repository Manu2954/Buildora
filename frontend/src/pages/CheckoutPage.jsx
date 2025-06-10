import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth, AuthProvider } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import { ChevronRight, ShieldCheck, MapPin, CreditCard, ShoppingBag, AlertTriangle } from 'lucide-react';

const CheckoutPage = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const { user, token, loading: authLoading } = useAuth(); // Destructure loading state from AuthContext
    console.log("tt--" , useAuth())
    const navigate = useNavigate();

    const [shippingAddress, setShippingAddress] = useState({
        address: '',
        city: '',
        postalCode: '',
        state: '',
        country: 'India',
    });
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Only run checks after the auth state has finished loading
        if (!authLoading) {
            if (!user) {
                navigate('/login?redirect=/checkout');
            } else if (cart.items.length === 0 && !isLoading) { // prevent redirect while processing order
                navigate('/products');
            }
        }
    }, [user, authLoading, cart.items, navigate, isLoading]);

    const handleShippingChange = (e) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };

    const placeOrderHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const orderData = {
                orderItems: cart.items.map(item => ({
                    _id: item._id,
                    name: item.name,
                    image: item.image,
                    price: item.price,
                    quantity: item.quantity,
                    variant: item.variant,
                })),
                shippingAddress,
                paymentMethod,
                itemsPrice: cartTotal,
                shippingPrice: 0, 
                taxPrice: 0,
                totalPrice: cartTotal,
            };

            const createdOrder = await createOrder(orderData, token);
            clearCart();
            navigate(`/order/${createdOrder._id}/success`);

        } catch (err) {
            setError(err.message || 'Failed to place order. Please try again.');
            setIsLoading(false);
        }
    };
    
    const inputClass = "block w-full px-3 py-2 mt-1 placeholder-gray-400 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

    // Show a loading state while the authentication is being verified
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600">Verifying authentication...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container px-4 py-12 mx-auto">
                <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-center text-gray-900">Secure Checkout</h1>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {/* Left Side: Shipping and Payment */}
                    <div className="md:col-span-2">
                        <form onSubmit={placeOrderHandler}>
                            <div className="p-6 bg-white rounded-lg shadow-md">
                                <h2 className="flex items-center text-xl font-bold text-gray-800"><MapPin className="mr-3 text-indigo-600"/> Shipping Address</h2>
                                <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2">
                                    <div><label htmlFor="address" className="block text-sm font-medium text-gray-700">Address / Street</label><input type="text" name="address" id="address" value={shippingAddress.address} onChange={handleShippingChange} className={inputClass} required /></div>
                                    <div><label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label><input type="text" name="city" id="city" value={shippingAddress.city} onChange={handleShippingChange} className={inputClass} required /></div>
                                    <div><label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label><input type="text" name="postalCode" id="postalCode" value={shippingAddress.postalCode} onChange={handleShippingChange} className={inputClass} required /></div>
                                    <div><label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label><input type="text" name="state" id="state" value={shippingAddress.state} onChange={handleShippingChange} className={inputClass} required /></div>
                                    <div className="sm:col-span-2"><label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label><input type="text" name="country" id="country" value={shippingAddress.country} onChange={handleShippingChange} className={inputClass} required /></div>
                                </div>
                            </div>
                             <div className="p-6 mt-8 bg-white rounded-lg shadow-md">
                                 <h2 className="flex items-center text-xl font-bold text-gray-800"><CreditCard className="mr-3 text-indigo-600"/> Payment Method</h2>
                                <div className="mt-4"><div className="flex items-center p-4 border rounded-lg"><input id="cod" name="paymentMethod" type="radio" checked className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" readOnly/><label htmlFor="cod" className="block ml-3 text-sm font-medium text-gray-700">Cash on Delivery</label></div><p className="mt-2 text-xs text-gray-500">More payment options coming soon.</p></div>
                            </div>
                             {error && <div className="flex items-center gap-2 p-3 mt-4 text-sm text-red-700 bg-red-100 rounded-md"><AlertTriangle size={18}/> {error}</div>}
                             <button type="submit" disabled={isLoading} className="flex items-center justify-center w-full px-6 py-3 mt-8 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-wait">
                                {isLoading ? 'Placing Order...' : 'Place Order'} <ShieldCheck size={20} className="ml-2" />
                            </button>
                        </form>
                    </div>
                    {/* Right Side: Order Summary */}
                     <div className="p-6 bg-white border rounded-lg shadow-md md:col-span-1 h-fit">
                        <h2 className="flex items-center pb-4 text-xl font-bold text-gray-800 border-b"><ShoppingBag className="mr-3 text-indigo-600"/> Order Summary</h2>
                        <div className="py-4 space-y-3 text-sm text-gray-700 border-b">
                            {cart.items.map(item => (
                                <div key={item.cartItemId} className="flex justify-between">
                                    <span className="pr-2">{item.name} {item.variant ? `(${item.variant.name})` : ''} x {item.quantity}</span>
                                    <span className="font-medium text-right">₹{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="py-4 space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between"><span>Subtotal</span><span>₹{cartTotal.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Shipping</span><span className="font-semibold text-green-600">FREE</span></div>
                        </div>
                        <div className="flex justify-between pt-4 font-bold text-gray-900 border-t">
                            <span>Order Total</span>
                            <span>₹{cartTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
