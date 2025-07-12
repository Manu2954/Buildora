const Advertisement = require('../../models/Advertisement');
const asyncHandler = require('../../middleware/async');
const ErrorResponse = require('../../utils/errorResponse');

// @desc    Get all advertisements
exports.getAds = asyncHandler(async (req, res, next) => {
    const ads = await Advertisement.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: ads });
});

// @desc    Create new advertisement
exports.createAd = asyncHandler(async (req, res, next) => {
    const { name, imageUrl, linkTo } = req.body;
    const ad = await Advertisement.create({ name, imageUrl, linkTo });
    res.status(201).json({ success: true, data: ad });
});

// @desc    Update advertisement (to toggle active status)
exports.updateAd = asyncHandler(async (req, res, next) => {
    // --- THIS IS THE KEY CHANGE ---
    // The logic to deactivate other ads has been removed.
    // This now allows for multiple ads to be active at the same time.
    const ad = await Advertisement.findByIdAndUpdate(req.params.id, req.body, { 
        new: true, 
        runValidators: true 
    });

    if (!ad) {
        return next(new ErrorResponse('Advertisement not found', 404));
    }
    res.status(200).json({ success: true, data: ad });
});

// @desc    Delete advertisement
exports.deleteAd = asyncHandler(async (req, res, next) => {
    const ad = await Advertisement.findByIdAndDelete(req.params.id);
    if (!ad) return next(new ErrorResponse('Ad not found', 404));
    res.status(200).json({ success: true, data: {} });
});
