const Order = require('../../models/Order');
const User = require('../../models/User');
const Company = require('../../models/Company');
const SearchLog = require('../../models/SearchLog'); // Import the new model
const asyncHandler = require('../../middleware/async');
const mongoose = require('mongoose');

// @desc    Get advanced analytics for the admin dashboard
// @route   GET /api/admin/dashboard/analytics
// @access  Private (Admin)
exports.getAdvancedAnalytics = asyncHandler(async (req, res, next) => {
    
    const dateFilter = {};
    if (req.query.startDate) dateFilter.$gte = new Date(req.query.startDate);
    if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
        dateFilter.$lte = endDate;
    }
    const dateMatch = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    // Run all analytic aggregations in parallel for maximum performance
    const [
        revenueStats,
        totalOrders,
        totalCustomers,
        salesOverTime,
        orderStatusDistribution,
        topSellingProducts,
        topCustomers,
        revenueByCategory,
        revenueByLocation,
        ordersByLocation,
        newCustomerTrend,
        topSearchTerms // New analytic
    ] = await Promise.all([
        Order.aggregate([
            { $match: { orderStatus: 'Delivered', ...dateMatch } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
        ]),
        Order.countDocuments(dateMatch),
        User.countDocuments({ role: { $ne: 'admin' }, ...dateMatch }),
        Order.aggregate([
            { $match: { createdAt: (dateMatch.createdAt || { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }), orderStatus: 'Delivered' } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, totalSales: { $sum: "$totalPrice" } } },
            { $sort: { _id: 1 } }, { $project: { _id: 0, date: '$_id', sales: '$totalSales' } }
        ]),
        Order.aggregate([
            { $match: dateMatch },
            { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
            { $project: { _id: 0, name: '$_id', value: '$count' } }
        ]),
        Order.aggregate([
            { $match: dateMatch }, { $unwind: '$orderItems' },
            { $group: { _id: '$orderItems._id', name: { $first: '$orderItems.name' }, totalQuantitySold: { $sum: '$orderItems.quantity' } } },
            { $sort: { totalQuantitySold: -1 } }, { $limit: 5 }, { $project: { _id: 0, name: 1, quantity: '$totalQuantitySold' } }
        ]),
        Order.aggregate([
            { $match: { orderStatus: 'Delivered', ...dateMatch } },
            { $group: { _id: '$user', totalSpent: { $sum: '$totalPrice' } } },
            { $sort: { totalSpent: -1 } }, { $limit: 5 },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userData' } },
            { $unwind: '$userData' }, { $project: { _id: 0, name: '$userData.name', email: '$userData.email', spent: '$totalSpent' } }
        ]),
        Order.aggregate([
            { $match: { orderStatus: 'Delivered', ...dateMatch } }, { $unwind: '$orderItems' },
            { $lookup: { from: 'companies', let: { productId: '$orderItems._id' }, pipeline: [ { $unwind: '$products' }, { $match: { $expr: { $eq: ['$products._id', '$$productId'] } } }, { $project: { _id: 0, category: '$products.category' } } ], as: 'productDetails' } },
            { $unwind: '$productDetails' }, { $group: { _id: '$productDetails.category', totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } } } },
            { $sort: { totalRevenue: -1 } }, { $project: { _id: 0, name: '$_id', value: '$totalRevenue' } }
        ]),
        Order.aggregate([
            { $match: { orderStatus: 'Delivered', ...dateMatch } },
            { $group: { _id: '$shippingAddress.city', totalRevenue: { $sum: '$totalPrice' } } },
            { $sort: { totalRevenue: -1 } }, { $limit: 10 }, { $project: { _id: 0, name: '$_id', revenue: '$totalRevenue' } }
        ]),
        Order.aggregate([
            { $match: dateMatch },
            { $group: { _id: '$shippingAddress.city', count: { $sum: 1 } } },
            { $sort: { count: -1 } }, { $limit: 10 }, { $project: { _id: 0, name: '$_id', orders: '$count' } }
        ]),
        User.aggregate([
            { $match: { role: { $ne: 'admin' }, ...dateMatch } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, newCustomers: { $sum: 1 } } },
            { $sort: { _id: 1 } }, { $project: { _id: 0, date: '$_id', count: '$newCustomers' } }
        ]),
        // --- NEW: Top Search Terms Aggregation ---
       SearchLog.aggregate([
            { $match: dateMatch },
            {
                $group: {
                    _id: '$term', // Group by the 'term' field
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
            {
                $project: {
                    _id: 0,
                    term: '$_id', // Project the grouped term into a 'term' field
                    count: '$count'
                }
            }
        ])
    ]);

    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;

    res.status(200).json({
        success: true,
        data: {
            totalRevenue,
            totalOrders,
            totalCustomers,
            salesOverTime,
            orderStatusDistribution,
            topSellingProducts,
            topCustomers,
            revenueByCategory,
            revenueByLocation,
            ordersByLocation,
            newCustomerTrend,
            topSearchTerms // Add the new data to the response
        }
    });
});
