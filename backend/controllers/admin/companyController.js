
// backend/controllers/admin/adminCompanyController.js
const Company = require('../../models/Company'); // Adjust path
const Admin = require('../../models/Admin'); // Adjust path
const mongoose = require('mongoose');

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
const addProductToCompany = async (req, res) => {
    const { companyId } = req.params;
    const productData = req.body; // Expects product data matching the productSchema

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
        return res.status(400).json({ message: 'Invalid company ID format' });
    }

    try {
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        // Validate product data (basic example, consider more robust validation)
        if (!productData.name || !productData.description || !productData.category || !productData.pricing || !productData.pricing.basePrice || !productData.stock || productData.stock.quantity === undefined) {
            return res.status(400).json({ message: 'Missing required product fields (name, description, category, pricing.basePrice, stock.quantity)' });
        }

        // Check if SKU is provided and if it's unique within this company or globally (depending on requirements)
        // For simplicity, this example doesn't enforce global SKU uniqueness here but model has unique constraint.
        if (productData.sku) {
            const existingProductWithSKU = company.products.find(p => p.sku === productData.sku);
            if (existingProductWithSKU) {
                return res.status(400).json({ message: `Product with SKU '${productData.sku}' already exists in this company.` });
            }
        }

        company.products.push(productData);
        const updatedCompany = await company.save();
        
        // Return the newly added product or the updated company
        const newProduct = updatedCompany.products[updatedCompany.products.length - 1];
        res.status(201).json(newProduct);

    } catch (error) {
        console.error('Error adding product to company:', error);
        if (error.name === 'ValidationError') { // This will catch validation errors from productSchema
            return res.status(400).json({ message: 'Product validation failed', errors: error.errors });
        }
        res.status(500).json({ message: 'Server error adding product', error: error.message });
    }
};

/**
 * @desc    Update a product within a specific company
 * @route   PUT /api/admin/companies/:companyId/products/:productId
 * @access  Private (Admin Authenticated)
 */
const updateProductInCompany = async (req, res) => {
    const { companyId, productId } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(companyId) || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Invalid company or product ID format' });
    }

    try {
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const product = company.products.id(productId); // Mongoose subdocument .id() method
        if (!product) {
            return res.status(404).json({ message: 'Product not found in this company' });
        }

        // Handle SKU uniqueness if SKU is being updated
        if (updates.sku && updates.sku !== product.sku) {
            const existingProductWithSKU = company.products.find(p => p.sku === updates.sku && p._id.toString() !== productId);
            if (existingProductWithSKU) {
                return res.status(400).json({ message: `Another product with SKU '${updates.sku}' already exists in this company.` });
            }
        }

        // Apply updates to the product object
        // This merges updates into the product subdocument.
        // Be careful with nested objects like 'pricing' or 'stock', you might need to set them explicitly or merge carefully.
        Object.keys(updates).forEach(key => {
            // Special handling for nested objects if a full replace is not desired
            if (key === 'pricing' && typeof updates.pricing === 'object' && product.pricing) {
                product.pricing = { ...product.pricing, ...updates.pricing };
            } else if (key === 'stock' && typeof updates.stock === 'object' && product.stock) {
                 product.stock = { ...product.stock, ...updates.stock };
            }
            else if (key === 'attributes' && Array.isArray(updates.attributes) && product.attributes) {
                // Example: replace attributes. Add more sophisticated merging if needed.
                product.attributes = updates.attributes;
            }
             else if (key === 'dimensions' && typeof updates.dimensions === 'object' && product.dimensions) {
                product.dimensions = { ...product.dimensions, ...updates.dimensions };
            }
             else if (key === 'weight' && typeof updates.weight === 'object' && product.weight) {
                product.weight = { ...product.weight, ...updates.weight };
            }
            else {
                 // Direct update for other fields
                product[key] = updates[key];
            }
        });


        await company.save(); // This will trigger validation for subdocuments too
        res.status(200).json(product);

    } catch (error) {
        console.error('Error updating product in company:', error);
         if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Product validation failed', errors: error.errors });
        }
        res.status(500).json({ message: 'Server error updating product', error: error.message });
    }
};

/**
 * @desc    Remove a product from a specific company
 * @route   DELETE /api/admin/companies/:companyId/products/:productId
 * @access  Private (Admin Authenticated)
 */
const removeProductFromCompany = async (req, res) => {
    const { companyId, productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(companyId) || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Invalid company or product ID format' });
    }
    
    try {
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const product = company.products.id(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found in this company' });
        }

        // Using Mongoose 5+ `remove()` method on subdocument array directly
        // For Mongoose 6+, .pull() might be deprecated for this specific usage or behaves differently.
        // The most reliable way is often to find the index and splice, or use $pull operator with findByIdAndUpdate.
        // However, `product.remove()` on a subdocument instance (if supported by your Mongoose version) is cleanest.
        // Alternative: company.products.pull(productId); or company.products.id(productId).remove();

        // Using subdocument's remove method (common in older Mongoose, check current version docs)
        // product.remove(); // This mutates the parent's array

        // Safer way using pull for Mongoose:
        company.products.pull({ _id: productId });


        await company.save();
        res.status(200).json({ message: 'Product removed successfully' });

    } catch (error) {
        console.error('Error removing product from company:', error);
        res.status(500).json({ message: 'Server error removing product', error: error.message });
    }
};


/**
 * @desc    Get all products for a specific company
 * @route   GET /api/admin/companies/:companyId/products
 * @access  Private (Admin Authenticated)
 */
const getAllProductsForCompany = async (req, res) => {
    const { companyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
        return res.status(400).json({ message: 'Invalid company ID format' });
    }

    try {
        const company = await Company.findById(companyId).select('products name'); // Select only products and company name
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        res.status(200).json({ companyName: company.name, products: company.products });
    } catch (error) {
        console.error('Error fetching products for company:', error);
        res.status(500).json({ message: 'Server error fetching products', error: error.message });
    }
};


/**
 * @desc    Get a single product by its ID within a specific company
 * @route   GET /api/admin/companies/:companyId/products/:productId
 * @access  Private (Admin Authenticated)
 */
const getProductInCompanyById = async (req, res) => {
    const { companyId, productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(companyId) || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Invalid company or product ID format' });
    }

    try {
        const company = await Company.findById(companyId).select('products');
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const product = company.products.id(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found in this company' });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error('Error fetching product by ID from company:', error);
        res.status(500).json({ message: 'Server error fetching product', error: error.message });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const aggregationPipeline = [
            // Deconstruct the products array from each company document
            { $unwind: '$products' },
            // Shape the output for each product
            {
                $project: {
                    _id: '$products._id', // Product ID
                    name: '$products.name',
                    sku: '$products.sku',
                    category: '$products.category',
                    basePrice: '$products.pricing.basePrice',
                    quantity: '$products.stock.quantity',
                    isActive: '$products.isActive',
                    images: '$products.images', // Include images for frontend preview
                    company: { // Embed parent company info
                        _id: '$_id',
                        name: '$name'
                    },
                    createdAt: '$products.createdAt'
                }
            },
            // Sort by creation date, newest first
            { $sort: { createdAt: -1 } },
            // Facet for getting both total count and paginated data in one query
            {
                $facet: {
                    products: [
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    totalCount: [
                        { $count: 'count' }
                    ]
                }
            }
        ];

        const results = await Company.aggregate(aggregationPipeline);
        
        const products = results[0].products;
        const totalCount = results[0].totalCount.length > 0 ? results[0].totalCount[0].count : 0;
        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            products,
            page,
            totalPages,
            totalCount,
            limit
        });

    } catch (error) {
        console.error('Error fetching all products:', error);
        res.status(500).json({ message: 'Server error fetching all products', error: error.message });
    }
};

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
