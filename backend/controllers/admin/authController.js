const Admin = require('../../models/Admin'); // Adjust path
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d', // e.g., '1h', '7d', '30d'
    });
};

/**
 * @desc    Register a new admin (use with caution, perhaps only for initial setup or by superadmin)
 * @route   POST /api/admin/auth/register
 * @access  Public (or protected if only superadmin can register others)
 */
const registerAdmin = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password' });
        }

        const adminExists = await Admin.findOne({ email });
        if (adminExists) {
            return res.status(400).json({ message: 'Admin with this email already exists' });
        }

        const admin = await Admin.create({
            name,
            email,
            password, // Password will be hashed by the pre-save hook in the model
            role: role || 'admin', // Default to 'admin' if not provided
        });

        if (admin) {
            res.status(201).json({
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                token: generateToken(admin._id),
                message: "Admin registered successfully"
            });
        } else {
            res.status(400).json({ message: 'Invalid admin data' });
        }
    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({ message: 'Server error during admin registration', error: error.message });
    }
};

/**
 * @desc    Authenticate admin & get token (Login)
 * @route   POST /api/admin/auth/login
 * @access  Public
 */
const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const admin = await Admin.findOne({ email });

        if (admin && (await admin.comparePassword(password))) {
            res.json({
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                token: generateToken(admin._id),
                message: "Admin logged in successfully"
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error during admin login', error: error.message });
    }
};

/**
 * @desc    Get current logged-in admin's profile
 * @route   GET /api/admin/auth/me
 * @access  Private (Admin Authenticated)
 */
const getAdminProfile = async (req, res) => {
    // req.admin is attached by the adminAuth middleware
    if (req.admin) {
        res.json({
            _id: req.admin._id,
            name: req.admin.name,
            email: req.admin.email,
            role: req.admin.role,
            createdAt: req.admin.createdAt
        });
    } else {
        // This case should ideally not be reached if adminAuth middleware is working correctly
        res.status(404).json({ message: 'Admin not found' });
    }
};

module.exports = {
    registerAdmin,
    loginAdmin,
    getAdminProfile,
};
