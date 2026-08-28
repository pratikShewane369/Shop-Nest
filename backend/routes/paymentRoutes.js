const express = require('express');
const router = express.Router();

const { protected } = require('../middlewares/authMiddleware'); // adjust if your auth middleware lives elsewhere/has a different name

const {
  createCheckoutSession,
  confirmPayment,
  failPayment,
} = require('../controllers/paymentController');

router.post('/create-checkout-session', protected, createCheckoutSession);
router.get('/confirm', protected, confirmPayment);
router.get('/fail', protected, failPayment);    

module.exports = router;


// const express = require('express');

// const router = express.Router();
// const {createOrder, verifyPayment} = require('../controllers/paymentController')

// router.post('/orders', createOrder);
// router.post('/verify', verifyPayment);

// module.exports = router;