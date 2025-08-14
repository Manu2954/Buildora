const { validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const asyncHandler = require('../middleware/async');

// @desc    Create a new lead from public CTA
// @route   POST /api/leads
// @access  Public
exports.createLead = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, mobileNumber, location, requirementDescription } = req.body;
    const lead = await Lead.create({
        fullName,
        mobileNumber,
        location,
        requirementDescription,
    });

    res.status(201).json({ success: true, message: 'Lead submitted successfully', data: lead });
});

