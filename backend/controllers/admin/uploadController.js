const ErrorResponse = require('../../utils/errorResponse');

// @desc    Upload a single image
// @route   POST /api/admin/upload/single
// @access  Private (Admin)
exports.uploadSingleImage = (req, res, next) => {
    // By the time this function runs, multer has already processed the file.
    if (!req.file) {
        return next(new ErrorResponse('Error: No file selected!', 400));
    }
    
    // The file was uploaded successfully. Return its public URL.
    res.status(200).json({
        success: true,
        message: 'Image uploaded sauccessfully',
        data: `/uploads/images/${req.file.filename}` // The URL path to the file
    });
};


// @desc    Upload multiple images
// @route   POST /api/admin/upload/multiple
// @access  Private (Admin)
exports.uploadMultipleImages = (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next(new ErrorResponse('Error: No files selected!', 400));
    }
    
    // Map over the req.files array to get the path of each uploaded file
    const fileUrls = req.files.map(file => `/uploads/images/${file.filename}`);
    
    res.status(200).json({
        success: true,
        message: `${req.files.length} images uploaded successfully`,
        data: fileUrls // Return an array of the public URLs
    });
};
