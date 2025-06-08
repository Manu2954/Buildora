const User = require('../../models/User'); // Customer/Dealer User model
const Admin = require('../../models/Admin'); // Admin User model, to exclude them from the list
const asyncHandler = require('../../middleware/async'); // A utility to handle async errors
const ErrorResponse = require('../../utils/errorResponse'); // A custom error class

// @desc    Get all users (customers/dealers)
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = asyncHandler(async (req, res, next) => {
    // 1. Get all admin emails to exclude them from the user list
    const adminEmails = (await Admin.find({}, 'email')).map(admin => admin.email);

    // 2. Build the query object
    const query = {
        email: { $nin: adminEmails } // Exclude any user whose email matches an admin's
    };

    if (req.query.role) {
        query.role = req.query.role;
    }

    if (req.query.search) {
        query.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } }
        ];
    }
    
    // 3. Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await User.countDocuments(query);

    const users = await User.find(query).skip(startIndex).limit(limit).sort({ createdAt: -1 });
    
    res.status(200).json({
        success: true,
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
    });
});

// @desc    Get single user by ID
// @route   GET /api/admin/users/:userId
// @access  Private (Admin)
exports.getUserById = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.userId);

    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.userId}`, 404));
    }

    res.status(200).json({ success: true, data: user });
});

// @desc    Update user details (e.g., role, isActive)
// @route   PUT /api/admin/users/:userId
// @access  Private (Admin)
exports.updateUser = asyncHandler(async (req, res, next) => {
    // Fields that an admin is allowed to update
    const { role, isActive } = req.body;
    
    const fieldsToUpdate = {};
    if (role !== undefined) fieldsToUpdate.role = role;
    if (isActive !== undefined) fieldsToUpdate.isActive = isActive;

    if (Object.keys(fieldsToUpdate).length === 0) {
        return next(new ErrorResponse('Please provide a field to update (role or isActive)', 400));
    }
    
    const user = await User.findByIdAndUpdate(req.params.userId, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.userId}`, 404));
    }

    res.status(200).json({ success: true, data: user });
});

// @desc    Delete a user
// @route   DELETE /api/admin/users/:userId
// @access  Private (Admin)
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.userId);

    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.userId}`, 404));
    }

    await user.deleteOne(); // Use deleteOne() Mongoose document method

    res.status(200).json({ success: true, message: "User removed successfully" });
});
