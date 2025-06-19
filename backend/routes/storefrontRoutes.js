const express = require('express');
const router = express.Router();

const {
    getAllProducts,
    getProductById,
    getFilterOptions,
    getSearchSuggestions,
    getRelatedProducts
} = require('../controllers/storefrontController');

// These routes are public and do not require authentication.

router.route('/filters')
    .get(getFilterOptions); // New route to get filter data

router.route('/products')
    .get(getAllProducts);

router.route('/products/:productId')
    .get(getProductById);
router.get('/suggestions', getSearchSuggestions);
router.get('/related-products/:productId/:category', getRelatedProducts);
module.exports = router;
