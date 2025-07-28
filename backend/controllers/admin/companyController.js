
// backend/controllers/admin/adminCompanyController.js
const Company = require('../../models/Company'); // Adjust path
const Admin = require('../../models/Admin'); // Adjust path
const mongoose = require('mongoose');
const asyncHandler = require('../../middleware/async');

/**
 * @desc    Create a new company
 * @route   POST /api/admin/companies
 * @access  Private (Admin Authenticated)
 */
const createCompany = async (req, res) => {
    const { name, description, logoUrl, address, contactEmail, contactPhone, website, products, isActive } = req.body;
    
    try {
        if (!name) {
            return res.status(400).json({ message: 'Company name is required' });
        }

        const companyExists = await Company.findOne({ name });
        if (companyExists) {
            return res.status(400).json({ message: `Company with name '${name}' already exists` });
        }

        const newCompany = new Company({
            name,
            description,
            logoUrl,
            address,
            contactEmail,
            contactPhone,
            website,
            products: products || [], // Can initialize with products
            createdBy: req.admin._id, // Logged-in admin
            isActive: isActive !== undefined ? isActive : true,
        });

        const savedCompany = await newCompany.save();
        res.status(201).json(savedCompany);
    } catch (error) {
        console.error('Error creating company:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Server error creating company', error: error.message });
    }
};

/**
 * @desc    Get all companies
 * @route   GET /api/admin/companies
 * @access  Private (Admin Authenticated)
 */
const getAllCompanies = async (req, res) => {
    try {
        // Add pagination later if needed
        const companies = await Company.find({}).populate('createdBy', 'name email'); // Populate admin who created it
        res.status(200).json(companies);
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({ message: 'Server error fetching companies', error: error.message });
    }
};

/**
 * @desc    Get a single company by ID
 * @route   GET /api/admin/companies/:companyId
 * @access  Private (Admin Authenticated)
 */
const getCompanyById = async (req, res) => {
    const { companyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
        return res.status(400).json({ message: 'Invalid company ID format' });
    }

    try {
        const company = await Company.findById(companyId).populate('createdBy', 'name email');
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        res.status(200).json(company);
    } catch (error) {
        console.error('Error fetching company by ID:', error);
        res.status(500).json({ message: 'Server error fetching company', error: error.message });
    }
};

/**
 * @desc    Update company details (excluding products)
 * @route   PUT /api/admin/companies/:companyId
 * @access  Private (Admin Authenticated)
 */
const updateCompanyDetails = async (req, res) => {
    const { companyId } = req.params;
    const { name, description, logoUrl, address, contactEmail, contactPhone, website, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
        return res.status(400).json({ message: 'Invalid company ID format' });
    }
    
    try {
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        // Check for name uniqueness if name is being changed
        if (name && name !== company.name) {
            const existingCompany = await Company.findOne({ name });
            if (existingCompany) {
                return res.status(400).json({ message: `Company with name '${name}' already exists.` });
            }
        }
        
        company.name = name || company.name;
        company.description = description || company.description;
        company.logoUrl = logoUrl || company.logoUrl;
        company.address = address || company.address;
        company.contactEmail = contactEmail || company.contactEmail;
        company.contactPhone = contactPhone || company.contactPhone;
        company.website = website || company.website;
        if (isActive !== undefined) {
            company.isActive = isActive;
        }
        // company.updatedBy = req.admin._id; // Track who updated if needed

        const updatedCompany = await company.save();
        res.status(200).json(updatedCompany);
    } catch (error) {
        console.error('Error updating company details:', error);
         if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Server error updating company', error: error.message });
    }
};

/**
 * @desc    Delete a company
 * @route   DELETE /api/admin/companies/:companyId
 * @access  Private (Admin Authenticated)
 */
const deleteCompany = async (req, res) => {
    const { companyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
        return res.status(400).json({ message: 'Invalid company ID format' });
    }

    try {
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        await company.deleteOne(); // or company.remove() for older mongoose versions
        res.status(200).json({ message: 'Company removed successfully' });
    } catch (error) {
        console.error('Error deleting company:', error);
        res.status(500).json({ message: 'Server error deleting company', error: error.message });
    }
};


// --- Product Management within a Company ---

/**
 * @desc    Add a product to a specific company
 * @route   POST /api/admin/companies/:companyId/products
 * @access  Private (Admin Authenticated)
 */
const addProductToCompany = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params;
    const { name, description, category, variants, isActive } = req.body;

    const company = await Company.findById(companyId);
    if (!company) {
        return next(new ErrorResponse('Company not found', 404));
    }

    // --- NEW VALIDATION LOGIC ---
    if (!name || !description || !category) {
        return next(new ErrorResponse('Product name, description, and category are required', 400));
    }
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
        return next(new ErrorResponse('Product must have at least one variant', 400));
    }

    for (const variant of variants) {
        if (!variant.name || variant.stock === undefined || !variant.pricing || variant.pricing.ourPrice === undefined) {
            return next(new ErrorResponse(`Each variant must have a name, stock, and 'ourPrice'. Check variant: "${variant.name || 'Unnamed'}"`, 400));
        }
        // Optional: Check for SKU uniqueness across all products in the company
        if (variant.sku) {
            const skuExists = company.products.some(p => p.variants.some(v => v.sku === variant.sku));
            if (skuExists) {
                 return next(new ErrorResponse(`SKU '${variant.sku}' already exists in this company.`, 400));
            }
        }
    }

    const newProduct = { name, description, category, variants, isActive };
    company.products.push(newProduct);
    await company.save();

    const createdProduct = company.products[company.products.length - 1];
    res.status(201).json({ success: true, data: createdProduct });
});


/**
 * @desc    Update a product within a specific company
 * @route   PUT /api/admin/companies/:companyId/products/:productId
 * @access  Private (Admin Authenticated)
 */
const updateProductInCompany = asyncHandler(async (req, res, next) => {
    const { companyId, productId } = req.params;
    const updates = req.body;

    const company = await Company.findById(companyId);
    if (!company) {
        return next(new ErrorResponse('Company not found', 404));
    }

    const product = company.products.id(productId);
    if (!product) {
        return next(new ErrorResponse('Product not found in this company', 404));
    }

    // --- NEW UPDATE LOGIC ---
    // Update top-level fields
    product.name = updates.name || product.name;
    product.description = updates.description || product.description;
    product.category = updates.category || product.category;
    product.isActive = updates.isActive !== undefined ? updates.isActive : product.isActive;

    // Replace the entire variants array. This is the simplest and safest approach.
    if (updates.variants && Array.isArray(updates.variants)) {
        // Basic validation for incoming variants
        for (const variant of updates.variants) {
            if (!variant.name || variant.stock === undefined || !variant.pricing || variant.pricing.ourPrice === undefined) {
                 return next(new ErrorResponse(`Each variant must have a name, stock, and 'ourPrice'.`, 400));
            }
        }
        product.variants = updates.variants;
    }

    await company.save();
    res.status(200).json({ success: true, data: product });
});


/**
 * @desc    Remove a product from a specific company
 * @route   DELETE /api/admin/companies/:companyId/products/:productId
 * @access  Private (Admin Authenticated)
 */
const removeProductFromCompany = asyncHandler(async (req, res, next) => {
    const { companyId, productId } = req.params;

    // Using findByIdAndUpdate with $pull is the most robust method
    const company = await Company.findByIdAndUpdate(companyId,
        { $pull: { products: { _id: productId } } },
        { new: true }
    );

    if (!company) {
        return next(new ErrorResponse('Company not found or product not removed', 404));
    }

    res.status(200).json({ success: true, message: 'Product removed successfully' });
});

/**
 * @desc    Get all products for a specific company
 * @route   GET /api/admin/companies/:companyId/products
 * @access  Private (Admin Authenticated)
 */
const getAllProductsForCompany = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params;
    const company = await Company.findById(companyId).select('products name');

    if (!company) {
        return next(new ErrorResponse('Company not found', 404));
    }

    res.status(200).json({ success: true, data: { companyName: company.name, products: company.products } });
});



/**
 * @desc    Get a single product by its ID within a specific company
 * @route   GET /api/admin/companies/:companyId/products/:productId
 * @access  Private (Admin Authenticated)
 */const getProductInCompanyById = asyncHandler(async (req, res, next) => {
    const { companyId, productId } = req.params;
    const company = await Company.findById(companyId).select('products');

    if (!company) {
        return next(new ErrorResponse('Company not found', 404));
    }

    const product = company.products.id(productId);
    if (!product) {
        return next(new ErrorResponse('Product not found in this company', 404));
    }

    res.status(200).json({ success: true, data: product });
});

const getAllProducts = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // --- NEW AGGREGATION PIPELINE ---
    const aggregationPipeline = [
        { $unwind: '$products' },
        { $unwind: '$products.variants' }, // Unwind the nested variants array
        {
            $project: {
                _id: '$products.variants._id', // Variant ID
                variantName: '$products.variants.name',
                sku: '$products.variants.sku',
                stock: '$products.variants.stock',
                ourPrice: '$products.variants.pricing.ourPrice',
                images: '$products.variants.images',
                isActive: '$products.isActive',
                product: { // Embed parent product info
                    _id: '$products._id',
                    name: '$products.name',
                    category: '$products.category',
                },
                company: { // Embed parent company info
                    _id: '$_id',
                    name: '$name'
                },
                createdAt: '$products.variants.createdAt'
            }
        },
        { $sort: { 'product.name': 1, variantName: 1 } },
        {
            $facet: {
                paginatedResults: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: 'count' }]
            }
        }
    ];

    const results = await Company.aggregate(aggregationPipeline);
    const variants = results[0].paginatedResults;
    const totalCount = results[0].totalCount.length > 0 ? results[0].totalCount[0].count : 0;
    
    res.status(200).json({
        success: true,
        count: variants.length,
        pagination: {
            page,
            totalPages: Math.ceil(totalCount / limit),
            totalCount
        },
        data: variants,
    });
});

module.exports = {
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
};
