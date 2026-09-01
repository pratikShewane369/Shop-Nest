const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

const getAdminStats = async (req, res) => {
  try {
    const start = Date.now();

    const [
      totalOrders,
      totalProducts,
      totalUsers,
      revenueResult
    ] = await Promise.all([
      Order.countDocuments({}),
      Product.countDocuments({}),
      User.countDocuments({ role: 'user' }),

      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: '$totalAmount'
            }
          }
        }
      ])
    ]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0;

    console.log(`Admin Analytics API: ${Date.now() - start}ms`);

    res.json({
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue
    });

  } catch (error) {
    console.error('Analytics Error:', error);

    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = { getAdminStats };