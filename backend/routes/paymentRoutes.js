const express = require('express');
const router = express.Router();

const { authMiddleware  } = require('../middlewares/authMiddleware'); // adjust if your auth middleware lives elsewhere/has a different name

const {
  createCheckoutSession,
  confirmPayment,
  failPayment,
} = require('../controllers/paymentController');

router.post('/create-checkout-session', authMiddleware , createCheckoutSession);
router.get('/confirm', authMiddleware , confirmPayment);
router.get('/fail', authMiddleware , failPayment);    

module.exports = router;
