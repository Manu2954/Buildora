const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { createLead } = require('../controllers/leadController');

router.post(
  '/',
  [
    body('fullName', 'Full name is required').notEmpty(),
    body('mobileNumber', 'Mobile number is required').notEmpty(),
    body('location', 'Location is required').notEmpty(),
    body('requirementDescription', 'Requirement description is required').notEmpty(),
  ],
  createLead
);

module.exports = router;
