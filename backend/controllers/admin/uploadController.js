// --- controllers/admin/uploadController.js ---

const multer = require('multer');
const path = require('path');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/async');

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: './public/uploads/images', // Ensure this folder exists in your 'public' directory
    filename: function(req, file, cb){
        // Create a unique filename: fieldname-timestamp.extension
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize upload variable with Multer options
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // Limit file size to 10MB
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
}).single('file'); // 'file' is the name of the input field on the frontend

// Helper function to check file type
function checkFileType(file, cb){
    // Allowed extensions
    const filetypes = /jpeg|jpg|png|gif/;
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime type
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null, true);
    } else {
        cb(new ErrorResponse('Error: Images Only!', 400));
    }
}


// @desc    Upload a single image
// @route   POST /api/admin/upload
// @access  Private (Admin)
exports.uploadImage = (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            return next(err);
        }
        if (req.file == undefined) {
            return next(new ErrorResponse('Error: No File Selected!', 400));
        }
        
        // File has been uploaded successfully.
        // Now, return the public URL of the uploaded file.
        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            // The URL will be relative to your backend's public path
            // e.g., http://localhost:5000/uploads/images/file-162432...jpg
            data: `/uploads/images/${req.file.filename}`
        });
    });
};

