const express = require('express');
const router = express.Router();
const {
    registerAdmin,
    loginAdmin,
    getAdminProfile
} = require('../controllers/admin/authController'); // Adjust path

const {
    createCompany,
    getAllCompanies,
    getCompanyById,
    updateCompanyDetails,
    deleteCompany,
    addProductToCompany,
    updateProductInCompany,
    removeProductFromCompany,
    getAllProductsForCompany,
    getProductInCompanyById, 
    getAllProducts
} = require('../controllers/admin/companyController'); // Adjust path

const { adminAuth } = require('../middleware/adminAuth'); // Adjust path
const { body } = require('express-validator'); // For input validation

// === Admin Authentication Routes ===
router.post(
    '/auth/register',
    [ // Basic validation example
        body('name', 'Name is required').notEmpty(),
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Password must be 6 or more characters').isLength({ min: 6 })
    ],
    registerAdmin // Consider protecting this route, e.g., only one superadmin can be created initially
);
router.post(
    '/auth/login',
    [
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Password is required').exists()
    ],
    loginAdmin
);
router.get('/auth/me', adminAuth, getAdminProfile);


// === Company Management Routes (Protected by adminAuth) ===
router.post(
    '/companies',
    adminAuth,
    [ // Validation for company creation
        body('name', 'Company name is required').trim().notEmpty(),
        body('contactEmail', 'Valid contact email is required').optional().isEmail(),
        // Add more validation as needed for other fields
    ],
    createCompany
);
router.get('/companies', adminAuth, getAllCompanies);
router.get('/companies/:companyId', adminAuth, getCompanyById);
router.put(
    '/companies/:companyId',
    adminAuth,
    [
        body('name', 'Company name must be a non-empty string if provided').optional().trim().notEmpty(),
        body('contactEmail', 'Valid contact email is required if provided').optional().isEmail(),
    ],
    updateCompanyDetails
);
router.delete('/companies/:companyId', adminAuth, deleteCompany);


// === Product Management within a Company Routes (Protected by adminAuth) ===
router.post(
    '/companies/:companyId/products',
    adminAuth,
    [ // Validation for adding a product
        body('name', 'Product name is required').trim().notEmpty(),
        body('description', 'Product description is required').trim().notEmpty(),
        body('category', 'Product category is required').trim().notEmpty(),
        body('pricing.basePrice', 'Product base price is required and must be a number').isNumeric().toFloat(),
        body('stock.quantity', 'Stock quantity is required and must be a number').isNumeric().toInt(),
        body('pricing.tiers.*.minQuantity', 'Tier minimum quantity must be a positive number').optional().isInt({ min: 1 }),
        body('pricing.tiers.*.pricePerUnit', 'Tier price per unit must be a non-negative number').optional().isFloat({ min: 0 }),
    ],
    addProductToCompany
);

router.get('/companies/:companyId/products', adminAuth, getAllProductsForCompany);
router.get('/companies/:companyId/products/:productId', adminAuth, getProductInCompanyById);
router.get('/products/all', adminAuth, getAllProducts);

router.put(
    '/companies/:companyId/products/:productId',
    adminAuth,
    [ // Optional: Add validation for product updates as well
        body('name', 'Product name must be a non-empty string if provided').optional().trim().notEmpty(),
        body('pricing.basePrice', 'Product base price must be a number if provided').optional().isNumeric().toFloat(),
        body('stock.quantity', 'Stock quantity must be a number if provided').optional().isNumeric().toInt(),
    ],
    updateProductInCompany
);
router.delete('/companies/:companyId/products/:productId', adminAuth, removeProductFromCompany);

module.exports = router;
