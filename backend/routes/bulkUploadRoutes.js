const express = require('express');
const router = express.Router({ mergeParams: true }); // Important: mergeParams allows access to :companyId
const multer = require('multer');

const { bulkUploadProducts } = require('../controllers/admin/bulkUploadController');

// Import your admin-specific authentication middleware
const { adminAuth } = require('../middleware/adminAuth');

// Multer configuration for handling file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// All routes in this file are adminAuthed and require an 'admin' role
router.use(adminAuth);

// The 'upload.single('file')' middleware processes the uploaded file
router.route('/')
    .post(upload.single('file'), bulkUploadProducts);

module.exports = router;
