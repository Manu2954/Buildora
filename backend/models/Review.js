const mongoose = require('mongoose');

// This schema will be embedded within the ProductSchema
const ReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    name: { // Store user's name to avoid an extra lookup when displaying reviews
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: [true, 'Please add a comment'],
    }
}, {
    timestamps: true,
});


// We will not create a model from this, as it will be used as a sub-document.
module.exports = ReviewSchema;
