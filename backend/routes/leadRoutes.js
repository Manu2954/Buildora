const express = require('express');
const router = express.Router();
const { createLead } = require('../controllers/leadController');
const { body } = require('express-validator');

router.post('/', [
    body('fullName', 'Full name is required').notEmpty(),
    body('mobileNumber', 'Mobile number is required').notEmpty(),
    body('requirementDescription', 'Requirement description is required').notEmpty(),
], createLead);

module.exports = router;
