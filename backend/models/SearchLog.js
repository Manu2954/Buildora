const mongoose = require('mongoose');

const SearchLogSchema = new mongoose.Schema({
    term: {
        type: String,
        required: true,
        trim: true,
        lowercase: true, // Standardize search terms by making them lowercase
    },
    user: { // Optional: Track which user searched for what
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    // The source can tell us where the search was made (e.g., header bar, filter sidebar)
    source: {
        type: String,
        default: 'unknown',
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('SearchLog', SearchLogSchema);
