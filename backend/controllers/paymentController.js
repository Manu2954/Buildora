const Razorpay = require('razorpay');
const crypto = require('crypto');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Order = require('../models/Order'); // Import the Order model

// Initialize Razorpay instance from environment variables
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a Razorpay order to initiate payment
// @route   POST /api/payment/create-order
// @access  Private (Customer)
exports.createRazorpayOrder = asyncHandler(async (req, res, next) => {
    const { amount, currency = 'INR' } = req.body;

    if (!amount) {
        return next(new ErrorResponse('Amount is required', 400));
    }

    const options = {
        amount: Math.round(amount * 100), // Amount in the smallest currency unit (paise)
        currency,
        receipt: `receipt_order_${new Date().getTime()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        if (!order) {
            return next(new ErrorResponse('Could not create payment order with Razorpay', 500));
        }
        res.status(200).json({
            success: true,
            order, // Send the full order object to the client
        });
    } catch (error) {
        console.error('Razorpay order creation failed:', error);
        return next(new ErrorResponse('Could not create payment order', 500));
    }
});


// @desc    Verify Razorpay payment signature and update order status
// @route   POST /api/payment/verify
// @access  Private (Customer)
exports.verifyPayment = asyncHandler(async (req, res, next) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id_from_db } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id_from_db) {
        return next(new ErrorResponse('Payment verification details are required', 400));
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');
    
    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        // Payment is verified, now find our order and update it.
        const order = await Order.findById(order_id_from_db);

        if (!order) {
            return next(new ErrorResponse('No order found with the provided ID.', 404));
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentMethod = 'Razorpay'; // Be more specific than 'Online'
        order.paymentResult = {
            id: razorpay_payment_id,
            status: 'success',
            update_time: new Date().toISOString(),
            email_address: req.user.email,
        };
        
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully and order updated.',
            paymentId: razorpay_payment_id,
        });
    } else {
        return next(new ErrorResponse('Payment signature verification failed. Payment is not authentic.', 400));
    }
});
