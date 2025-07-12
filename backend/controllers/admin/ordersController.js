const Order = require('../../models/Order');
const User = require('../../models/User');
const asyncHandler = require('../../middleware/async');
const ErrorResponse = require('../../utils/errorResponse');
const { getOrderStatusUpdateHTML } = require('../../utils/emailTemplates');
const  sendEmail  = require('../../utils/sendEmail');

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private (Admin)
exports.getAllOrders = asyncHandler(async (req, res, next) => {
    // --- Build a dynamic query object based on request queries ---
    const query = {};

    // Filter by status
    if (req.query.status) {
        query.orderStatus = req.query.status;
    }

    // Filter by payment method
    if (req.query.paymentMethod) {
        query.paymentMethod = req.query.paymentMethod;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
        query.createdAt = {};
        if (req.query.startDate) {
            query.createdAt.$gte = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
            // Set the time to the end of the day to include all orders on that date
            const endDate = new Date(req.query.endDate);
            endDate.setHours(23, 59, 59, 999);
            query.createdAt.$lte = endDate;
        }
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
        query.totalPrice = {};
        if (req.query.minPrice) {
            query.totalPrice.$gte = parseInt(req.query.minPrice, 10);
        }
        if (req.query.maxPrice) {
            query.totalPrice.$lte = parseInt(req.query.maxPrice, 10);
        }
    }
    
    // You can also add pagination here later if needed

    const orders = await Order.find(query)
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

    
    // --- SEND STATUS UPDATE EMAIL ---
    if (updatedOrder.orderStatus === 'Shipped' || updatedOrder.orderStatus === 'Delivered') {
        try {
            const customer = await User.findById(updatedOrder.user);
            if (customer) {
                 await sendEmail({
                    email: customer.email,
                    subject: `Your Buildora Order #${updatedOrder._id} has been ${updatedOrder.orderStatus}`,
                    html: getOrderStatusUpdateHTML(customer, updatedOrder)
                });
            }
        } catch (err) {
            console.error("Failed to send status update email:", err);
        }
    }

    res.status(200).json({
        success: true,
        data: updatedOrder
    });
});
