const express = require('express');
const router = express.Router();

const {
    getAdvancedAnalytics
} = require('../controllers/admin/dashboardController');

// Import your admin-specific authentication middleware
const { adminAuth } = require('../middleware/adminAuth');

// Protect all routes in this file
router.use(adminAuth);
// router.use(authorize('admin', 'superadmin'));

// router.route('/stats')
//     .get(getDashboardStats);

router.route('/analytics')
    .get(getAdvancedAnalytics);

module.exports = router;
