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

    // 1. Check if a file was uploaded
    if (!req.file) {
        return next(new ErrorResponse('Please upload a CSV file', 400));
    }

    // 2. Find the company to add products to
    const company = await Company.findById(companyId);
    if (!company) {
        return next(new ErrorResponse(`Company not found with id of ${companyId}`, 404));
    }

    const newProducts = [];
    const errors = [];
    let rowCount = 0;

    // 3. Create a readable stream from the uploaded file's buffer
    const stream = Readable.from(req.file.buffer.toString());

    stream
        .pipe(csv())
        .on('data', (row) => {
            rowCount++;
            // 4. For each row, structure the product data
            // This assumes your CSV has columns like 'name', 'description', 'category', 'basePrice', 'stock', etc.
            // It also handles complex nested data for variants and attributes if provided in the CSV.
            
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
                images: row.images ? row.images.split('|') : [], // Assuming image URLs are separated by '|'
                // Assuming variants are provided as a JSON string in a 'variants' column
                variants: row.variants ? JSON.parse(row.variants) : [],
                attributes: row.attributes ? JSON.parse(row.attributes) : [],
            };

            // Basic validation
            if (!product.name || !product.category || !product.pricing.basePrice || !product.stock.quantity) {
                errors.push(`Row ${rowCount}: Missing required fields (name, category, basePrice, stock).`);
            } else {
                newProducts.push(product);
            }
        })
        .on('end', async () => {
            // 5. Once the file is fully parsed, add the new products to the company
            if (newProducts.length > 0) {
                company.products.push(...newProducts);
                await company.save();
            }

            console.log('Bulk upload finished.');
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
