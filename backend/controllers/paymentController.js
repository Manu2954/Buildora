const Razorpay = require('razorpay');
const crypto = require('crypto');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
exports.createRazorpayOrder = asyncHandler(async (req, res, next) => {
    const { amount, currency = 'INR' } = req.body;

    if (!amount) {
        return next(new ErrorResponse('Amount is required', 400));
    }

    const options = {
        amount: amount * 100, // Amount in the smallest currency unit (paise for INR)
        currency,
        receipt: `receipt_order_${new Date().getTime()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        res.status(200).json({
            success: true,
            order, // Send the full order object to the client
        });
    } catch (error) {
        console.error('Razorpay order creation failed:', error);
        return next(new ErrorResponse('Could not create payment order', 500));
    }
});


// @desc    Verify Razorpay payment signature
// @route   POST /api/payment/verify
// @access  Private
exports.verifyPayment = asyncHandler(async (req, res, next) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return next(new ErrorResponse('Payment verification details are required', 400));
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');
    
    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        // Here, you would typically save the payment details to your database
        // and associate it with the order you created earlier.
        // For now, we just confirm verification.
        res.status(200).json({
            success: true,
            message: 'Payment verified successfully.',
            paymentId: razorpay_payment_id,
        });
    } else {
        return next(new ErrorResponse('Payment signature verification failed', 400));
    }
});
