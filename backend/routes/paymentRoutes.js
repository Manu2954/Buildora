const express = require('express');
const router = express.Router();

const {
    createRazorpayOrder,
    verifyPayment
} = require('../controllers/paymentController');

// Import the customer-specific authentication middleware
const { protect } = require('../auth/auth.middleware');

// All routes are protected for logged-in users
router.use(protect);

router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);

module.exports = router;
