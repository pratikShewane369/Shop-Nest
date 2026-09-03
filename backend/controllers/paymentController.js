const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Product = require("../models/productModel");
const Order = require("../models/orderModel"); // adjust path/model name if different

// @route   POST /api/payments/create-checkout-session
// @desc    Create a pending order + start a Stripe Checkout session
// @access  Private

const createCheckoutSession = async (req, res) => {
  try {
    const { items, address } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (!address) {
      return res.status(400).json({
        message: "Shipping address is required",
      });
    }

    const productIds = items.map((item) => item.productId || item._id);

    const products = await Product.find({
      _id: { $in: productIds },
    }).lean();

    if (products.length !== items.length) {
      return res.status(400).json({
        message: "One or more products are unavailable",
      });
    }

    const orderItems = [];

    let calculatedTotal = 0;

    for (const item of items) {
      const productId = item.productId || item._id;

      const product = products.find(
        (p) => p._id.toString() === productId.toString(),
      );

      if (!product) {
        return res.status(400).json({
          message: `Product not found: ${productId}`,
        });
      }

      if (product.stock < item.qty) {
        return res.status(400).json({
          message: `${product.name} does not have enough stock`,
        });
      }

      const quantity = Number(item.qty);

      if (!quantity || quantity < 1) {
        return res.status(400).json({
          message: "Invalid product quantity",
        });
      }

      calculatedTotal += product.price * quantity;

      orderItems.push({
        productId: product._id,
        quantity,
        price: product.price,
      });
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount: calculatedTotal,
      address,
      paymentStatus: "pending",
    });

    const line_items = orderItems.map((item) => {
      const product = products.find(
        (p) => p._id.toString() === item.productId.toString(),
      );

      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: product.name,
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      };
    });
    console.log("Creating Stripe Checkout Session");
    console.log(
      "Stripe account/key configured:",
      process.env.STRIPE_SECRET_KEY?.slice(0, 12),
    );
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&orderId=${order._id}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-fail?orderId=${order._id}`,
      metadata: { orderId: order._id.toString() },
    });

    res.json({ url: session.url, orderId: order._id });
  } catch (error) {
    console.error("Stripe session error:", error);
    res.status(500).json({ message: "Unable to create checkout session" });
  }
};

// @route   GET /api/payments/confirm
// @desc    Verify session with Stripe, mark order paid
// @access  Private
const confirmPayment = async (req, res) => {
  try {
    const { session_id, orderId } = req.query;
    if (!session_id || !orderId) {
      return res.status(400).json({ message: "Missing session_id or orderId" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    // if (session.payment_status === "paid") {
    //   const existingOrder = await Order.findById(orderId);

    //   if (!existingOrder) {
    //     return res.status(404).json({ message: "Order not found" });
    //   }

    //   // Only decrement stock the first time this order gets confirmed —
    //   // guards against double-decrementing if this route is hit again
    //   // (page refresh, back/forward navigation, etc.)
    //   if (existingOrder.paymentStatus !== "paid") {
    //     for (const item of existingOrder.items) {
    //       const updatedProduct = await Product.findOneAndUpdate(
    //         {
    //           _id: item.productId,
    //           stock: { $gte: item.quantity },
    //         },
    //         {
    //           $inc: { stock: -item.quantity },
    //         },
    //         {
    //           new: true,
    //         },
    //       );

    //       if (!updatedProduct) {
    //         return res.status(400).json({
    //           message: `Insufficient stock for product ${item.productId}`,
    //         });
    //       }
    //     }
    //   }

    //   const order = await Order.findByIdAndUpdate(
    //     orderId,
    //     { paymentStatus: "paid", paymentId: session.payment_intent },
    //     { new: true },
    //   );

    //   return res.json({ message: "Payment confirmed", order });
    // }

    return res.status(400).json({ message: "Payment not completed" });
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({ message: "Could not verify payment" });
  }
};

const stripeWebhook = async (req, res) => {
  console.log("🔥 WEBHOOK HIT");
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error(
      "Stripe webhook signature verification failed:",
      error.message,
    );

    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  console.log(`Stripe Webhook Event: ${event.type}`);

  try {
    // We only need this event for our order confirmation
    if (event.type !== "checkout.session.completed") {
      return res.json({ received: true });
    }

    const session = event.data.object;
    const eventId = event.id;

    console.log("Checkout Session:", session.id);
    console.log("Payment Status:", session.payment_status);
    console.log("Metadata:", session.metadata);

    if (session.payment_status !== "paid") {
      console.log("Payment not completed yet");
      return res.json({ received: true });
    }

    const orderId = session.metadata?.orderId;

    if (!orderId) {
      console.error("Webhook: orderId missing from checkout session metadata");

      return res.json({ received: true });
    }

    const existingOrder = await Order.findById(orderId);

    if (!existingOrder) {
      console.error("Webhook: Order not found:", orderId);
      return res.json({ received: true });
    }

    // Prevent duplicate processing
    if (
      existingOrder.paymentStatus === "paid" ||
      existingOrder.stripeEventId === eventId
    ) {
      console.log(`Order ${orderId} already processed`);
      return res.json({ received: true });
    }

    // Reduce stock
    for (const item of existingOrder.items) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          stock: { $gte: item.quantity },
        },
        {
          $inc: {
            stock: -item.quantity,
          },
        },
        {
          new: true,
        },
      );

      if (!updatedProduct) {
        console.error(`Insufficient stock for product ${item.productId}`);

        return res.status(400).json({
          message: "Insufficient stock",
        });
      }
    }

    // Update order
    existingOrder.paymentStatus = "paid";
    existingOrder.paymentId = session.payment_intent;

    await existingOrder.save();

    console.log(`Payment confirmed successfully: ${orderId}`);

    return res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing error:", error);

    return res.status(500).json({
      message: "Webhook processing failed",
    });
  }
};

// @route   GET /api/payments/fail
// @desc    Mark an order's payment as failed
// @access  Private
const failPayment = async (req, res) => {
  try {
    const { orderId } = req.query;
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: "failed" });
    }
    res.json({ message: "Payment marked as failed" });
  } catch (error) {
    res.status(500).json({ message: "Error updating order status" });
  }
};

module.exports = {
  createCheckoutSession,
  confirmPayment,
  failPayment,
  stripeWebhook,
};
