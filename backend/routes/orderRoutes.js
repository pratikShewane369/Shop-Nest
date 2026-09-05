const express = require('express');
const router = express.Router();

const {admin} = require('../middlewares/adminMiddleware');
const { authMiddleware } = require('../middlewares/authMiddleware');
const {createOrder, getOrders, myOrders, updateOrderStatus} = require('../controllers/orderController');

router.route('/').post(authMiddleware , createOrder).get(authMiddleware , admin, getOrders);
router.route('/myorders').get(authMiddleware , myOrders);
router.route('/:id/status').put(authMiddleware , admin, updateOrderStatus);

module.exports = router;