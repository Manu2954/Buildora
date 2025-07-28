const Company = require('../../models/Company');
const asyncHandler = require('../../middleware/async');
const ErrorResponse = require('../../utils/errorResponse');
const csv = require('csv-parser');
const { Readable } = require('stream');

/**
 * @desc    Bulk upload products from a CSV file to a company
 * @route   POST /api/admin/companies/:companyId/products/bulk-upload
 * @access  Private (Admin)
 */
exports.bulkUploadProducts = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params;

    if (!req.file) {
        return next(new ErrorResponse('Please upload a CSV file', 400));
    }

    const company = await Company.findById(companyId);
    if (!company) {
        return next(new ErrorResponse(`Company not found with id of ${companyId}`, 404));
    }

    // Use a Map to group variants by productName
    const productsMap = new Map();
    const errors = [];
    let rowCount = 0;

    const stream = Readable.from(req.file.buffer.toString('utf-8'));

    stream
        .pipe(csv())
        .on('data', (row) => {
            rowCount++;

            // --- 1. Validate required fields for each row (variant) ---
            const { productName, variantName, ourPrice, stock } = row;
            if (!productName || !variantName || !ourPrice || !stock) {
                errors.push(`Row ${rowCount}: Missing required fields. 'productName', 'variantName', 'ourPrice', and 'stock' are required.`);
                return; // Skip this invalid row
            }

            // --- 2. Create the variant object from the row data ---
            const variant = {
                name: variantName,
                sku: row.sku || '',
                stock: parseInt(stock, 10),
                pricing: {
                    ourPrice: parseFloat(ourPrice),
                    mrp: row.mrp ? parseFloat(row.mrp) : undefined,
                    manufacturerPrice: row.manufacturerPrice ? parseFloat(row.manufacturerPrice) : undefined,
                },
                images: row.images ? row.images.split('|').map(url => url.trim()) : [],
                videos: row.videos ? row.videos.split('|').map(url => url.trim()) : [],
                dimensions: {
                    length: row.length ? parseFloat(row.length) : undefined,
                    width: row.width ? parseFloat(row.width) : undefined,
                    height: row.height ? parseFloat(row.height) : undefined,
                    unit: row.dimensionUnit || undefined,
                },
                weight: {
                    value: row.weightValue ? parseFloat(row.weightValue) : undefined,
                    unit: row.weightUnit || undefined,
                },
                attributes: [], // Will be parsed below
            };
            
            // Safely parse JSON attributes
            if (row.attributes) {
                try {
                    variant.attributes = JSON.parse(row.attributes);
                } catch (e) {
                    errors.push(`Row ${rowCount}: Invalid JSON format for attributes.`);
                }
            }


            // --- 3. Group variants under a single product ---
            if (!productsMap.has(productName)) {
                // If this is the first time we see this product, create its entry
                productsMap.set(productName, {
                    name: productName,
                    description: row.productDescription || '',
                    category: row.productCategory || 'Uncategorized',
                    variants: [],
                });
            }

            // Add the current variant to its parent product
            productsMap.get(productName).variants.push(variant);
        })
        .on('end', async () => {
            // --- 4. After parsing, add the new products to the company ---
            if (productsMap.size > 0) {
                const newProducts = Array.from(productsMap.values());
                company.products.push(...newProducts);
                await company.save();
            }

            res.status(201).json({
                success: true,
                message: `Bulk upload processed. Added ${productsMap.size} new products. Found ${errors.length} rows with errors.`,
                addedProducts: productsMap.size,
                errorRows: errors.length,
                errors: errors,
            });
        })
        .on('error', (err) => {
            return next(new ErrorResponse('Error parsing CSV file: ' + err.message, 500));
        });
});