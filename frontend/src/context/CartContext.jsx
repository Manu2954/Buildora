import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// --- Safe localStorage Helper Functions ---
const safeGetItem = (key) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.warn(`Could not access localStorage to get item '${key}':`, error);
        return null;
    }
};

const safeSetItem = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn(`Could not access localStorage to set item '${key}':`, error);
    }
};
// -----------------------------------------

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_TO_CART': {
            const { item, quantity } = action.payload;
            const cartItemId = item.variant ? `${item._id}-${item.variant._id}` : item._id;
            const existingItem = state.items.find(i => i.cartItemId === cartItemId);

            if (existingItem) {
                return {
                    ...state,
                    items: state.items.map(i =>
                        i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + quantity } : i
                    ),
                };
            }
            return {
                ...state,
                items: [...state.items, { ...item, quantity, cartItemId }],
            };
        }
        case 'UPDATE_QUANTITY': {
            const { cartItemId, quantity } = action.payload;
            return {
                ...state,
                items: state.items.map(item =>
                    item.cartItemId === cartItemId ? { ...item, quantity } : item
                ).filter(item => item.quantity > 0),
            };
        }
        case 'REMOVE_FROM_CART': {
            return {
                ...state,
                items: state.items.filter(item => item.cartItemId !== action.payload.cartItemId),
            };
        }
        case 'CLEAR_CART': {
            return { ...state, items: [] };
        }
        case 'LOAD_CART': {
            // Ensure payload and cart exist and have an items array
            return action.payload?.cart?.items ? action.payload.cart : { items: [] };
        }
        default:
            return state;
    }
};

// FIX: Use the safe getter function to get the initial state.
const getInitialState = () => {
    const localCart = safeGetItem('buildoraCart');
    return localCart || { items: [] };
};

export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, getInitialState());

    useEffect(() => {
        // FIX: Use the safe setter function to save state.
        safeSetItem('buildoraCart', state);
    }, [state]);

    const addToCart = (item, quantity) => {
        dispatch({ type: 'ADD_TO_CART', payload: { item, quantity } });
    };

    const updateQuantity = (cartItemId, newQuantity) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { cartItemId, quantity: newQuantity } });
    };

    const removeFromCart = (cartItemId) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: { cartItemId } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };
    
    const cartCount = state.items.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = state.items.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);

    const value = {
        cart: state,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
