// --- routes/searchLogRoutes.js ---

const express = require('express');
const router = express.Router();
const { logSearch } = require('../controllers/searchLogController');

// This route can be public, or you can add optional protection
router.post('/', logSearch);

module.exports = router;