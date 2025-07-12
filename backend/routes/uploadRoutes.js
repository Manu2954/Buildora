const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ErrorResponse = require('../utils/errorResponse');

const {
    uploadSingleImage,
    uploadMultipleImages
} = require('../controllers/admin/uploadController');
const { adminAuth } = require('../middleware/adminAuth');

// --- Multer Configuration ---
const storage = multer.diskStorage({
    destination: './public/uploads/images',
    filename: function(req, file, cb){
        cb(null, 'image-' + Date.now() + path.extname(file.originalname));
    }
});

function checkFileType(file, cb){
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if(mimetype && extname){
        return cb(null, true);
    } else {
        cb(new ErrorResponse('Error: Please upload image files only!', 400));
    }
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
});
// --- End of Multer Configuration ---


// Protect all routes in this file
router.use(adminAuth);

// Route for single image upload
// The upload.single('file') middleware will run first, then the controller.
router.post('/single', upload.single('file'), uploadSingleImage);

// Route for multiple image upload
// The upload.array('files', 20) middleware will run first.
router.post('/multiple', upload.array('files', 20), uploadMultipleImages);

module.exports = router;
