const express = require('express');
const router = express.Router();
const { getLeads, getLeadById, updateLead } = require('../controllers/leadController');
const { adminAuth } = require('../middleware/adminAuth');

router.route('/').get(adminAuth, getLeads);
router
  .route('/:id')
  .get(adminAuth, getLeadById)
  .put(adminAuth, updateLead);

module.exports = router;
