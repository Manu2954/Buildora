const express = require('express');
const router = express.Router();

const {
    addOrderItems,
    getOrderById,
    getMyOrders
} = require('../controllers/ordersController');

// Import the customer-specific authentication middleware
const { protect } = require('../auth/auth.middleware');

// const { authenticate } = require('../middlewares/auth.middleware');
// router.get('/protected', authenticate, (req, res) => {
//   res.json({ message: 'You are authenticated' });
// });

// All routes in this file are protected for logged-in customers
router.route('/')
    .post(protect, addOrderItems);

router.route('/myorders')
    .get(protect, getMyOrders);
    
router.route('/:id')
    .get(protect, getOrderById);

module.exports = router;
