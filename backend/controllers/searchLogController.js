// --- controllers/searchLogController.js ---

const SearchLog = require('../models/SearchLog');
const asyncHandler = require('../middleware/async');

// @desc    Log a search term
// @route   POST /api/logs/search
// @access  Public (or Private, depending on if you want to track logged-in users)
exports.logSearch = asyncHandler(async (req, res, next) => {
    const { term } = req.body;

    if (!term || term.trim() === '') {
        // Don't log empty searches
        return res.status(200).json({ success: true });
    }

    await SearchLog.create({
        term: term.trim(),
        user: req.user ? req.user.id : null, // If user is logged in, associate the search
    });

    res.status(201).json({ success: true });
});



