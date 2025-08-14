const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    mobileNumber: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: String,
        trim: true,
    },
    requirementDescription: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'in_progress', 'closed'],
        default: 'new',
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null,
    },
    notes: {
        type: String,
        trim: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Lead', LeadSchema);
