// backend/models/Company.js
const mongoose = require('mongoose');
const ReviewSchema = require('./Review');

const VariantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Variant name (e.g., size, color) is required.'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Variant price is required.'],
    },
    stock: {
        type: Number,
        required: [true, 'Variant stock quantity is required.'],
        default: 0
    },
    sku: { // Optional: Each variant can have its own SKU
        type: String,
        trim: true
    },
    unit: { // e.g., 'kg', 'cm', 'sq. ft.', 'piece'
        type: String,
        trim: true
    }
});

// Updated Product Structure (embedded in Company)
const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    sku: { type: String }, // Base SKU for the product
    category: { type: String, required: true },
    
    // The basePrice and stock can now be considered defaults or a fallback
    // if no variants are present. The variant-specific price/stock takes precedence.
    pricing: {
        mrp: Number,
        basePrice: { type: Number, required: true },
    },
    stock: {
        quantity: { type: Number, required: true }
    },
    
    // REPLACED 'sizes' with 'variants'
    variants: [VariantSchema], // An array of product variants
    reviews: [ReviewSchema], // Add the new reviews array
    
    ratingsAverage: {
        type: Number,
        default: 0
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    images: [String],
    attributes: [{ name: String, value: String }],
    dimensions: { length: Number, width: Number, height: Number, unit: String },
    weight: { value: Number, unit: String },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});


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
    products: [ProductSchema],
    
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
