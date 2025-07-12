const express = require('express');
const router = express.Router();

const { createProductReview } = require('../controllers/reviewController');

const { protect } = require('../auth/auth.middleware');

// The route is protected, only logged-in users can leave a review
router.route('/product/:productId').post(protect, createProductReview);

module.exports = router;
