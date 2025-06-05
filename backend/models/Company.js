// backend/models/Company.js
const mongoose = require('mongoose');

// Define a schema for products that will be embedded in the Company model
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Product description is required"],
    },
    sku: { // Stock Keeping Unit
        type: String,
        unique: true, // SKU should be unique across all products if possible, or at least within a company
        sparse: true, // Allows multiple documents to have null for this field if not all products have SKUs initially
        trim: true,
    },
    category: {
        type: String, // Or mongoose.Schema.Types.ObjectId if referencing a Category collection
        required: [true, "Product category is required"],
    },
    pricing: {
        mrp: { // Maximum Retail Price (optional, could be a guideline)
            type: Number,
            min: [0, "MRP cannot be negative"],
        },
        basePrice: { // The price before any tier discounts, often the price for MOQ=1
            type: Number,
            required: [true, "Product base price is required"],
            min: [0, "Base price cannot be negative"],
        },
        tiers: [{ // For handling MOQ and bulk discounts
            minQuantity: {
                type: Number,
                required: [true, "Minimum quantity for tier is required"],
                default: 1,
                min: [1, "Minimum quantity must be at least 1"],
            },
            pricePerUnit: {
                type: Number,
                required: [true, "Price per unit for tier is required"],
                min: [0, "Price per unit cannot be negative"],
            },
            _id: false // Don't create an _id for each tier object
        }],
        // taxRate: { type: Number, default: 0 } // Example: 18 for 18% tax
    },
    stock: {
        quantity: {
            type: Number,
            required: [true, "Stock quantity is required"],
            min: [0, "Stock quantity cannot be negative"],
            default: 0,
        },
        // lastRestocked: { type: Date }
    },
    images: [{ // Array of image URLs
        type: String,
        trim: true,
    }],
    attributes: [{ // For additional product details like color, size, material
        name: String,
        value: String,
        _id: false
    }],
    dimensions: { // Optional: for physical products
        length: Number,
        width: Number,
        height: Number,
        unit: { type: String, default: 'cm' } // e.g., cm, inch
    },
    weight: { // Optional
        value: Number,
        unit: { type: String, default: 'kg' } // e.g., kg, lb
    },
    isActive: { // To control product visibility
        type: Boolean,
        default: true,
    },
    // You can add more fields as needed: manufacturer, brand, tags, etc.
}, { timestamps: true });


const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
        unique: true,
    },
    description: {
        type: String,
        trim: true,
    },
    logoUrl: {
        type: String,
        trim: true,
    },
    address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
    },
    contactEmail: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address for contact.'],
    },
    contactPhone: {
        type: String,
        trim: true,
    },
    website: {
        type: String,
        trim: true,
    },
    // Products are embedded in the company document
    products: [productSchema],
    
    // Admin who created/manages this company record
    // This assumes an admin is creating company profiles
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        // required: true // Make it required if an admin must always be linked
    },
    isActive: { // To control company visibility/status in the platform
        type: Boolean,
        default: true,
    },
    // Other fields like registrationNumber, taxId, etc.
}, { timestamps: true });

// Index for searching companies by name
companySchema.index({ name: 'text', description: 'text' });
// Index for efficient querying of products by name within a company (if needed for complex queries)
// Note: MongoDB has limitations on indexing deeply nested array fields for all query types.
// For complex product searching across all companies, a separate Product collection might be better.

const Company = mongoose.model('Company', companySchema);
module.exports = Company;
