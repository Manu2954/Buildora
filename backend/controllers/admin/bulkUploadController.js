const Company = require('../../models/Company');
const asyncHandler = require('../../middleware/async');
const ErrorResponse = require('../../utils/errorResponse');
const csv = require('csv-parser');
const { Readable } = require('stream');

// @desc    Bulk upload products from a CSV file to a company
// @route   POST /api/admin/companies/:companyId/products/bulk-upload
// @access  Private (Admin)
exports.bulkUploadProducts = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params;

    if (!req.file) {
        return next(new ErrorResponse('Please upload a CSV file', 400));
    }

    const company = await Company.findById(companyId);
    if (!company) {
        return next(new ErrorResponse(`Company not found with id of ${companyId}`, 404));
    }

    const newProducts = [];
    const errors = [];
    let rowCount = 0;

    const stream = Readable.from(req.file.buffer.toString());

    stream
        .pipe(csv())
        .on('data', (row) => {
            rowCount++;
            
            const product = {
                name: row.name,
                description: row.description,
                category: row.category,
                sku: row.sku,
                pricing: {
                    basePrice: parseFloat(row.basePrice),
                    mrp: row.mrp ? parseFloat(row.mrp) : undefined,
                },
                stock: {
                    quantity: parseInt(row.stock, 10),
                },
                // Assumes image URLs are provided in the CSV, separated by a pipe '|'
                // These URLs should point to your self-hosted images
                images: row.images ? row.images.split('|').map(url => url.trim()) : [],
                variants: row.variants ? JSON.parse(row.variants) : [],
                attributes: row.attributes ? JSON.parse(row.attributes) : [],
            };

            if (!product.name || !product.category || !product.pricing.basePrice || !product.stock.quantity) {
                errors.push(`Row ${rowCount}: Missing required fields (name, category, basePrice, stock).`);
            } else {
                newProducts.push(product);
            }
        })
        .on('end', async () => {
            if (newProducts.length > 0) {
                company.products.push(...newProducts);
                await company.save();
            }

            res.status(200).json({
                success: true,
                message: `Upload complete. Added ${newProducts.length} new products. Found ${errors.length} errors.`,
                added: newProducts.length,
                failed: errors.length,
                errors: errors,
            });
        })
        .on('error', (err) => {
            return next(new ErrorResponse('Error parsing CSV file', 500));
        });
});
