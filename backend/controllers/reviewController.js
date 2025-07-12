const Company = require('../models/Company');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create a new product review
// @route   POST /api/reviews/product/:productId
// @access  Private (Customer)
exports.createProductReview = asyncHandler(async (req, res, next) => {
    const { rating, comment } = req.body;
    const { productId } = req.params;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };
    
    // Find the company that contains the product
    const company = await Company.findOne({ "products._id": productId });

    if (!company) {
        return next(new ErrorResponse('Product not found', 404));
    }
    
    const product = company.products.id(productId);

    // Check if the user has already reviewed this product
    const isReviewed = product.reviews.find(
        r => r.user.toString() === req.user._id.toString()
    );

    if (isReviewed) {
        return next(new ErrorResponse('You have already reviewed this product', 400));
    }

    product.reviews.push(review);
    
    product.ratingsQuantity = product.reviews.length;
    product.ratingsAverage = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await company.save();

    res.status(201).json({
        success: true,
        message: 'Review added successfully',
    });
});
