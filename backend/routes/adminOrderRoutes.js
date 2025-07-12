const express = require('express');
const router = express.Router();

const {
    getAllOrders,
    getOrderById,
    updateOrderStatus
} = require('../controllers/admin/ordersController');

// Import your admin-specific authentication middleware
const { adminAuth } = require('../middleware/adminAuth');

// All routes in this file are protected and require an 'admin' or 'superadmin' role.
router.use(adminAuth);
// router.use();

router.route('/')
    .get(getAllOrders);
    
router.route('/:id')
    .get(getOrderById);

router.route('/:id/status')
    .put(updateOrderStatus);

module.exports = router;
