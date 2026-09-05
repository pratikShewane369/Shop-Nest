const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Product = require('../models/productModel'); 
const Order = require('../models/orderModel'); // adjust path/model name if different

// @route   POST /api/payments/create-checkout-session
// @desc    Create a pending order + start a Stripe Checkout session
// @access  Private

const createCheckoutSession = async (req, res) => {
  try {
    const { items, address, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Map cart items into the shape orderSchema actually expects
    const orderItems = items.map((item) => ({
      productId: item.productId || item._id, // adjust to whatever key your cart item uses for the product's Mongo _id
      quantity: item.qty,
      price: item.price,
    }));

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      address,
      paymentStatus: 'pending',
    });

    const line_items = items.map((item) => ({
      price_data: {
        currency: 'inr',
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&orderId=${order._id}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-fail?orderId=${order._id}`,
      metadata: { orderId: order._id.toString() },
    });

    res.json({ url: session.url, orderId: order._id });
  } catch (error) {
    console.error('Stripe session error:', error);
    res.status(500).json({ message: 'Unable to create checkout session' });
  }
};

// @route   GET /api/payments/confirm
// @desc    Verify session with Stripe, mark order paid
// @access  Private
const confirmPayment = async (req, res) => {
  try {
    const { session_id, orderId } = req.query;
    if (!session_id || !orderId) {
      return res.status(400).json({ message: 'Missing session_id or orderId' });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      const existingOrder = await Order.findById(orderId);

      if (!existingOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Only decrement stock the first time this order gets confirmed —
      // guards against double-decrementing if this route is hit again
      // (page refresh, back/forward navigation, etc.)
      if (existingOrder.paymentStatus !== 'paid') {
        for (const item of existingOrder.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity },
          });
        }
      }

      const order = await Order.findByIdAndUpdate(
        orderId,
        { paymentStatus: 'paid', paymentId: session.payment_intent },
        { new: true }
      );

      return res.json({ message: 'Payment confirmed', order });
    }

    return res.status(400).json({ message: 'Payment not completed' });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Could not verify payment' });
  }
};

// @route   GET /api/payments/fail
// @desc    Mark an order's payment as failed
// @access  Private
const failPayment = async (req, res) => {
  try {
    const { orderId } = req.query;
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed' });
    }
    res.json({ message: 'Payment marked as failed' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status' });
  }
};

module.exports = { createCheckoutSession, confirmPayment, failPayment };
