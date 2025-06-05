// backend/middleware/adminAuth.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin'); // Adjust path if necessary

const adminAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is in your .env

            // Get admin from the token
            req.admin = await Admin.findById(decoded.id).select('-password'); // Exclude password

            if (!req.admin) {
                return res.status(401).json({ message: 'Not authorized, admin not found' });
            }

            next(); // Proceed to the protected route
        } catch (error) {
            console.error('Admin authentication error:', error);
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Not authorized, token failed (invalid signature)' });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Not authorized, token expired' });
            }
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

module.exports = { adminAuth };
