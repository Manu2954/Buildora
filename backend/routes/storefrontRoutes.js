const express = require('express');
const router = express.Router();

const {
    getAllProducts,
    getProductById,
    getFilterOptions // Import the new controller function
} = require('../controllers/storefrontController');

// These routes are public and do not require authentication.

router.route('/filters')
    .get(getFilterOptions); // New route to get filter data

router.route('/products')
    .get(getAllProducts);

router.route('/products/:productId')
    .get(getProductById);

module.exports = router;
