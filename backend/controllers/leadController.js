const { validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create a new lead from CTA submission
// @route   POST /api/leads
// @access  Public
exports.createLead = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, mobileNumber, location, requirementDescription } = req.body;
  await Lead.create({ fullName, mobileNumber, location, requirementDescription });

  res.status(201).json({ success: true, message: 'Lead submitted successfully' });
});

// @desc    Get all leads
// @route   GET /api/admin/leads
// @access  Private (Admin)
exports.getLeads = asyncHandler(async (req, res, next) => {
  const leads = await Lead.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: leads });
});

// @desc    Get single lead by ID
// @route   GET /api/admin/leads/:id
// @access  Private (Admin)
exports.getLeadById = asyncHandler(async (req, res, next) => {
  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return next(new ErrorResponse('Lead not found', 404));
  }

  res.status(200).json({ success: true, data: lead });
});

// @desc    Update lead details (status, notes, etc.)
// @route   PUT /api/admin/leads/:id
// @access  Private (Admin)
exports.updateLead = asyncHandler(async (req, res, next) => {
  let lead = await Lead.findById(req.params.id);

  if (!lead) {
    return next(new ErrorResponse('Lead not found', 404));
  }

  lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: lead });
});
