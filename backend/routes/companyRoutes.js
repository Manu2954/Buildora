const express = require('express');
const router = express.Router();

// Import all the necessary controller functions for companies
const {
    createCompany,
    getAllCompanies,
    getCompanyById,
    updateCompanyDetails,
    deleteCompany
} = require('../controllers/admin/companyController'); 

// Import your admin-specific authentication middleware
const { adminAuth } = require('../middleware/adminAuth');

// All routes in this file are adminAuthed and require an 'admin' role.
router.use(adminAuth);
// router.use(authorize('admin', 'superadmin'));

// Route for getting all companies and creating a new one
router.route('/')
    .get(getAllCompanies)
    .post(createCompany);

// Route for getting, updating, and deleting a single company by its ID
router.route('/:companyId')
    .get(getCompanyById)
    .put(updateCompanyDetails)
    .delete(deleteCompany);

module.exports = router;
