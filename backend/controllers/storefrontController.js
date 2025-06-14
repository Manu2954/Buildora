const Company = require('../models/Company');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const mongoose = require('mongoose');

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
    // This function remains the same as the advanced version
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;

    let aggregation = [];
    
    const initialMatch = { isActive: true };
    if (req.query.companies) {
        const companyIds = req.query.companies.split(',').map(id => new mongoose.Types.ObjectId(id));
        initialMatch._id = { $in: companyIds };
    }
    aggregation.push({ $match: initialMatch });
    
    aggregation.push({ $unwind: '$products' });
    
    const productMatch = { 'products.isActive': true };
    if (req.query.categories) {
        const categories = req.query.categories.split(',');
        productMatch['products.category'] = { $in: categories };
    }
    if (req.query.minPrice) {
        productMatch['products.pricing.basePrice'] = { $gte: parseInt(req.query.minPrice, 10) };
    }
    if (req.query.maxPrice) {
        productMatch['products.pricing.basePrice'] = { 
            ...productMatch['products.pricing.basePrice'],
            $lte: parseInt(req.query.maxPrice, 10)
        };
    }
     if (req.query.search) {
         productMatch.$or = [
            { 'products.name': { $regex: req.query.search, $options: 'i' } },
            { 'products.description': { $regex: req.query.search, $options: 'i' } },
        ];
    }
    aggregation.push({ $match: productMatch });

    aggregation.push({
        $project: {
            _id: '$products._id', name: '$products.name', description: '$products.description',
            sku: '$products.sku', category: '$products.category', pricing: '$products.pricing',
            images: '$products.images', attributes: '$products.attributes', isActive: '$products.isActive',
            createdAt: '$products.createdAt', companyId: '$_id', companyName: '$name'
        }
    });

    let sortOption = { createdAt: -1 };
    if (req.query.sort) {
        if (req.query.sort === 'price-asc') sortOption = { 'pricing.basePrice': 1 };
        if (req.query.sort === 'price-desc') sortOption = { 'pricing.basePrice': -1 };
        if (req.query.sort === 'name-asc') sortOption = { 'name': 1 };
    }
    
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


// @desc    Get a single product by its ID
// @route   GET /api/storefront/products/:productId
// @access  Public
exports.getProductById = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(new ErrorResponse('Invalid product ID format', 400));
    }

    // Use a more robust aggregation pipeline to find the exact product
    const aggregationPipeline = [
        // 1. Unwind the products array to treat each product as a separate document
        { $unwind: '$products' },
        
        // 2. Match the exact product by its ID
        { $match: { 'products._id': new mongoose.Types.ObjectId(productId) } },
        
        // 3. Project the fields into the desired shape, adding company info
        {
            $project: {
                _id: '$products._id',
                name: '$products.name',
                description: '$products.description',
                sku: '$products.sku',
                category: '$products.category',
                pricing: '$products.pricing',
                stock: '$products.stock',
                variants: '$products.variants',
                images: '$products.images',
                attributes: '$products.attributes',
                dimensions: '$products.dimensions',
                weight: '$products.weight',
                isActive: '$products.isActive',
                createdAt: '$products.createdAt',
                companyId: '$_id',
                companyName: '$name'
            }
        }
    ];

    const results = await Company.aggregate(aggregationPipeline);

    if (!results || results.length === 0) {
        return next(new ErrorResponse(`Product not found with id of ${productId}`, 404));
    }

    // The result should be an array with a single product
    const product = results[0];

    res.status(200).json({
        success: true,
        data: product,
    });
});


exports.getSearchSuggestions = asyncHandler(async (req, res, next) => {
    const query = req.query.q || '';

    if (!query) {
        return res.status(200).json({ success: true, data: [] });
    }

    // This pipeline finds distinct categories and product names that match the search query.
    const suggestions = await Company.aggregate([
        // Only search within active companies and their active products
        { $match: { isActive: true } },
        { $unwind: '$products' },
        { $match: { 'products.isActive': true } },
        {
            $project: {
                productName: '$products.name',
                category: '$products.category'
            }
        },
        // Match against both product name and category
        {
            $match: {
                $or: [
                    { productName: { $regex: query, $options: 'i' } },
                    { category: { $regex: query, $options: 'i' } }
                ]
            }
        },
        // Create two streams: one for products, one for categories
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
        // Combine the results from both streams
        {
            $project: {
                suggestions: { $concatArrays: ['$categories', '$products'] }
            }
        },
        { $unwind: '$suggestions' },
        { $replaceRoot: { newRoot: '$suggestions' } }
    ]);

    res.status(200).json({
        success: true,
        data: suggestions
    });
});
