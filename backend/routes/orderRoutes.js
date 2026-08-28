const express = require('express');
const router = express.Router();

const {admin} = require('../middlewares/adminMiddleware');
const {protected} = require('../middlewares/authMiddleware');
const {createOrder, getOrders, myOrders, updateOrderStatus} = require('../controllers/orderController');

router.route('/').post(protected, createOrder).get(protected, admin, getOrders);
router.route('/myorders').get(protected, myOrders);
router.route('/:id/status').put(protected, admin, updateOrderStatus);

module.exports = router;