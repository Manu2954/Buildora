const Company = require('../models/Company');
const Order = require('../models/Order');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const mongoose = require('mongoose');
const Advertisement = require('../models/Advertisement');

// @desc    Get all data needed for filter sidebar (categories, companies)
// @route   GET /api/storefront/filters
// @access  Public
exports.getFilterOptions = asyncHandler(async (req, res, next) => {
    const [categories, companies] = await Promise.all([
        Company.aggregate([
            { $match: { isActive: true } },
            { $unwind: '$products' },
            { $match: { 'products.isActive': true } },
            { $group: { _id: '$products.category' } },
            { $sort: { _id: 1 } },
            { $project: { name: '$_id', _id: 0 } }
        ]),
        Company.find({ isActive: true }).select('name').sort({ name: 1 })
    ]);
    
    const categoryNames = categories.map(cat => cat.name);

    res.status(200).json({
        success: true,
        data: {
            categories: categoryNames,
            companies: companies
        }
    });
});


// @desc    Get all active products with advanced filtering and sorting
// @route   GET /api/storefront/products
// @access  Public
exports.getAllProducts = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;

    let aggregation = [];
    
    // Initial match for active companies and companies specified in filter
    const initialMatch = { isActive: true };
    if (req.query.companies) {
        const companyIds = req.query.companies.split(',').map(id => new mongoose.Types.ObjectId(id));
        initialMatch._id = { $in: companyIds };
    }
    aggregation.push({ $match: initialMatch });
    
    // Unwind products to work with them individually
    aggregation.push({ $unwind: '$products' });
    
    // Match against products
    const productMatch = { 'products.isActive': true };
    if (req.query.categories) {
        const categories = req.query.categories.split(',');
        productMatch['products.category'] = { $in: categories };
    }
    
    // ✅ FIX: Price filtering now targets the nested 'ourPrice' within the variants array.
    // We use $elemMatch to find products where at least one variant matches the price criteria.
    const priceFilter = {};
    if (req.query.minPrice) {
        priceFilter.$gte = parseInt(req.query.minPrice, 10);
    }
    if (req.query.maxPrice) {
        priceFilter.$lte = parseInt(req.query.maxPrice, 10);
    }
    if (Object.keys(priceFilter).length > 0) {
        productMatch['products.variants'] = {
            $elemMatch: { 'pricing.ourPrice': priceFilter }
        };
    }

    if (req.query.search) {
        productMatch.$or = [
            { 'products.name': { $regex: req.query.search, $options: 'i' } },
            { 'products.description': { $regex: req.query.search, $options: 'i' } },
        ];
    }
    aggregation.push({ $match: productMatch });

    // ✅ FIX: To sort by price, we first need to find the minimum price among all variants for each product.
    aggregation.push({
        $addFields: {
            "products.minPrice": { $min: "$products.variants.pricing.ourPrice" }
        }
    });

    // Reshape the documents to be a flat list of products with company info merged in.
    aggregation.push({
        $replaceRoot: {
            newRoot: {
                $mergeObjects: [
                    '$products',
                    { companyId: '$_id', companyName: '$name' }
                ]
            }
        }
    });

    // ✅ FIX: Sorting now uses the new 'minPrice' field for price sorting.
    let sortOption = { createdAt: -1 };
    if (req.query.sort) {
        if (req.query.sort === 'price-asc') sortOption = { 'minPrice': 1 };
        if (req.query.sort === 'price-desc') sortOption = { 'minPrice': -1 };
        if (req.query.sort === 'name-asc') sortOption = { 'name': 1 };
    }
    
    // Facet for pagination and total count
    aggregation.push({
        $facet: {
            paginatedResults: [ { $sort: sortOption }, { $skip: startIndex }, { $limit: limit } ],
            totalCount: [ { $count: 'count' } ]
        }
    });

    const results = await Company.aggregate(aggregation);
    
    const products = results[0].paginatedResults;
    const total = results[0].totalCount.length > 0 ? results[0].totalCount[0].count : 0;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
        success: true,
        count: products.length,
        pagination: { currentPage: page, totalPages, totalProducts: total },
        data: products,
    });
});

// This function is already correct and needs no changes.
exports.getProductById = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(new ErrorResponse('Invalid product ID format', 400));
    }
    const aggregationPipeline = [
        { $unwind: '$products' },
        { $match: { 'products._id': new mongoose.Types.ObjectId(productId) } },
        {
            $project: {
                _id: '$products._id', name: '$products.name', description: '$products.description',
                category: '$products.category', variants: '$products.variants', reviews: '$products.reviews',
                ratingsAverage: '$products.ratingsAverage', ratingsQuantity: '$products.ratingsQuantity',
                isActive: '$products.isActive', createdAt: '$products.createdAt',
                companyId: '$_id', companyName: '$name'
            }
        }
    ];
    const results = await Company.aggregate(aggregationPipeline);
    if (!results || results.length === 0) {
        return next(new ErrorResponse(`Product not found with id of ${productId}`, 404));
    }
    const product = results[0];
    res.status(200).json({ success: true, data: product });
});

// This function is already correct and needs no changes.
exports.getSearchSuggestions = asyncHandler(async (req, res, next) => {
    const query = req.query.q || '';
    if (!query) {
        return res.status(200).json({ success: true, data: [] });
    }
    const suggestions = await Company.aggregate([
        { $match: { isActive: true } },
        { $unwind: '$products' },
        { $match: { 'products.isActive': true } },
        { $project: { productName: '$products.name', category: '$products.category' } },
        { $match: { $or: [ { productName: { $regex: query, $options: 'i' } }, { category: { $regex: query, $options: 'i' } } ] } },
        {
            $facet: {
                products: [
                    { $match: { productName: { $regex: query, $options: 'i' } } },
                    { $group: { _id: '$productName' } },
                    { $limit: 5 },
                    { $project: { _id: 0, type: 'Product', name: '$_id' } }
                ],
                categories: [
                     { $match: { category: { $regex: query, $options: 'i' } } },
                     { $group: { _id: '$category' } },
                     { $limit: 3 },
                     { $project: { _id: 0, type: 'Category', name: '$_id' } }
                ]
            }
        },
        { $project: { suggestions: { $concatArrays: ['$categories', '$products'] } } },
        { $unwind: '$suggestions' },
        { $replaceRoot: { newRoot: '$suggestions' } }
    ]);
    res.status(200).json({ success: true, data: suggestions });
});

// This function is already correct and needs no changes.
exports.getRelatedProducts = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    const { category } = req.query;
    const products = await Company.aggregate([
        { $match: { isActive: true } },
        { $unwind: '$products' },
        { 
            $match: {
                'products.isActive': true,
                'products.category': category,
                'products._id': { $ne: new mongoose.Types.ObjectId(productId) }
            }
        },
        { $replaceRoot: { newRoot: '$products' } },
        { $limit: 4 }
    ]);
    res.status(200).json({ success: true, count: products.length, data: products });
});

// @desc    Get all data needed for the dynamic homepage
// @route   GET /api/storefront/homepage
// @access  Public
exports.getHomePageData = asyncHandler(async (req, res, next) => {
    const [
        featuredCategories,
        bestsellingProducts,
        newArrivals,
        activeAdvertisements
    ] = await Promise.all([
        // ✅ FIX: Get the image from the first variant of the first product in the category.
        Company.aggregate([
            { $match: { isActive: true } },
            { $unwind: '$products' },
            { $match: { 'products.isActive': true, 'products.variants.0.images.0': { $exists: true } } },
            { $sort: { 'products.createdAt': -1 } },
            {
                $group: {
                    _id: '$products.category',
                    productCount: { $sum: 1 },
                    image: { $first: { $arrayElemAt: [{ $arrayElemAt: ['$products.variants.images', 0] }, 0] } }
                }
            },
            { $sort: { productCount: -1 } },
            { $limit: 3 },
            { $project: { _id: 0, name: '$_id', image: 1 } }
        ]),
        // Get top 5 best-selling products (most ordered) - no changes needed
        Order.aggregate([
            { $unwind: '$orderItems' },
            { $group: { _id: '$orderItems.product', totalQuantitySold: { $sum: '$orderItems.quantity' } } },
            { $sort: { totalQuantitySold: -1 } },
            { $limit: 5 },
            { 
                $lookup: {
                    from: 'companies', let: { productId: '$_id' },
                    pipeline: [
                        { $unwind: '$products' },
                        { $match: { $expr: { $eq: ['$products._id', '$$productId'] } } },
                        { $replaceRoot: { newRoot: '$products' } }
                    ],
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            { $replaceRoot: { newRoot: '$productInfo' } }
        ]),
        // Get 5 newest products - no changes needed
        Company.aggregate([
             { $match: { isActive: true } },
             { $unwind: '$products' },
             { $match: { 'products.isActive': true } },
             { $sort: { 'products.createdAt': -1 } },
             { $limit: 5 },
             { $replaceRoot: { newRoot: '$products' } }
        ]),
        Advertisement.find({ isActive: true })
    ]);
    
    res.status(200).json({
        success: true,
        data: {
            featuredCategories,
            bestsellingProducts,
            newArrivals,
            activeAdvertisements
        }
    });
});
