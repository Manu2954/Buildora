const express = require('express');
const router = express.Router();
const { getLeads, getLeadById, updateLead } = require('../controllers/admin/leadController');
const { adminAuth } = require('../middleware/adminAuth');
const { body } = require('express-validator');

router.use(adminAuth);

router.route('/')
    .get(getLeads);

router.route('/:id')
    .get(getLeadById)
    .put([
        body('status').optional().isIn(['new', 'contacted', 'in_progress', 'closed']),
        body('assignedTo').optional().isMongoId(),
        body('notes').optional().trim(),
    ], updateLead);

module.exports = router;
