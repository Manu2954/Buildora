const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User'); // The Customer/Dealer User model

// Middleware to protect routes by verifying a customer's JWT
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check for token in the Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    }
    // You could also check for the token in cookies as a fallback if needed
    // else if (req.cookies.token) {
    //     token = req.cookies.token;
    // }

    // Make sure token exists
    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        // Verify token using the JWT_SECRET from your .env file
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        // console.log('Attempting to find user with ID from token:', decoded.userId);
        

        // Find the user by the ID that was stored in the token's payload.
        // Attach the user document to the request object (`req.user`)
        req.user = await User.findById(decoded.userId);
        
        if(!req.user) {
            // This case handles if a user was deleted but their token is still valid
            return next(new ErrorResponse('No user found with this id', 404));
        }

        next(); // User is authenticated, proceed to the next middleware or controller
    } catch (err) {
        // This will catch expired tokens or invalid token signatures
        return next(new ErrorResponse('Not authorized to access this route. Token may be invalid or expired.', 401));
    }
});
