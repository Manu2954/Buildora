const Order = require('../../models/Order');
const asyncHandler = require('../../middleware/async');
const ErrorResponse = require('../../utils/errorResponse');

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private (Admin)
exports.getAllOrders = asyncHandler(async (req, res, next) => {
    // We can add filtering by status later if needed
    const orders = await Order.find({})
        .populate('user', 'id name email') // Populate with user's id, name, and email
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
    });
});

// @desc    Get single order by ID (reusing customer controller logic is also an option)
// @route   GET /api/admin/orders/:id
// @access  Private (Admin)
exports.getOrderById = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
        return next(new ErrorResponse('Order not found with that ID', 404));
    }

    res.status(200).json({
        success: true,
        data: order
    });
});


// @desc    Update order status (e.g., to Shipped, Delivered)
// @route   PUT /api/admin/orders/:id/status
// @access  Private (Admin)
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
    const { status } = req.body;

    // A list of valid statuses to prevent arbitrary updates
    const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
        return next(new ErrorResponse(`Invalid status: ${status}`, 400));
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorResponse('Order not found with that ID', 404));
    }

    order.orderStatus = status;

    // If the status is 'Delivered', set the deliveredAt timestamp
    if (status === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
    }
    
    // If status is 'Shipped', you could add a 'shippedAt' timestamp if needed

    const updatedOrder = await order.save();

    res.status(200).json({
        success: true,
        data: updatedOrder
    });
});
