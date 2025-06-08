const User = require('../../models/User');
const Company = require('../../models/Company');
const Admin = require('../../models/Admin');
const asyncHandler = require('../../middleware/async');
const ErrorResponse = require('../../utils/errorResponse');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin)
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
    // 1. Get total users (excluding admins)
    const adminEmails = (await Admin.find({}, 'email')).map(admin => admin.email);
    const totalUsers = await User.countDocuments({ email: { $nin: adminEmails } });

    // 2. Get total companies
    const totalCompanies = await Company.countDocuments();

    // 3. Get total products
    // We need to aggregate the number of products from each company
    const productStats = await Company.aggregate([
        {
            $project: {
                productCount: { $size: '$products' } // Get the size of the products array
            }
        },
        {
            $group: {
                _id: null,
                totalProducts: { $sum: '$productCount' } // Sum up the counts
            }
        }
    ]);
    const totalProducts = productStats.length > 0 ? productStats[0].totalProducts : 0;

    // 4. Get user role breakdown
    const userRoles = await User.aggregate([
        {
            $match: { email: { $nin: adminEmails } } // Exclude admins
        },
        {
            $group: {
                _id: '$role', // Group by the role field
                count: { $sum: 1 } // Count documents in each group
            }
        },
        {
            $project: { // Reshape the output
                name: '$_id',
                value: '$count',
                _id: 0
            }
        }
    ]);
    
    // You could also add recent users/companies
    const recentUsers = await User.find({ email: { $nin: adminEmails } }).sort({ createdAt: -1 }).limit(5).select('name email createdAt');

    res.status(200).json({
        success: true,
        data: {
            totalUsers,
            totalCompanies,
            totalProducts,
            userRoles, // e.g., [{ name: 'customer', value: 10 }, { name: 'dealer', value: 2 }]
            recentUsers
        }
    });
});
