const Order = require('../models/Order');
const Company = require('../models/Company');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer)
exports.addOrderItems = asyncHandler(async (req, res, next) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return next(new ErrorResponse('No order items', 400));
    }

    // --- Server-side validation and stock update ---
    for (const item of orderItems) {
        // Find the company containing the product to update its stock
        const company = await Company.findOne({ "products._id": item._id });
        if (!company) {
            return next(new ErrorResponse(`Product not found: ${item.name}`, 404));
        }

        const product = company.products.id(item._id);
        
        // Check if the order is for a specific variant
        if (item.variant && item.variant._id) {
            const variant = product.variants.id(item.variant._id);
            if (variant.stock < item.quantity) {
                return next(new ErrorResponse(`Not enough stock for ${item.name} (${variant.name})`, 400));
            }
            variant.stock -= item.quantity;
        } else { // It's a base product
            if (product.stock.quantity < item.quantity) {
                return next(new ErrorResponse(`Not enough stock for ${item.name}`, 400));
            }
            product.stock.quantity -= item.quantity;
        }
        
        await company.save();
    }

    const order = new Order({
        orderItems,
        user: req.user._id, // req.user is from the 'protect' middleware
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    });

    const createdOrder = await order.save();

    res.status(201).json({
        success: true,
        data: createdOrder
    });
});


// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
        return next(new ErrorResponse('Order not found', 404));
    }

    // Ensure the user fetching the order is the one who placed it, or is an admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
         return next(new ErrorResponse('Not authorized to view this order', 401));
    }

    res.status(200).json({ success: true, data: order });
});


// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private (Customer)
exports.getMyOrders = asyncHandler(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
});
