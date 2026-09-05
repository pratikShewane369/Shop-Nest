const mockStripe = {
  checkout: {
    sessions: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
  },
};

jest.mock("stripe", () => {
  return jest.fn(() => mockStripe);
});

const request = require("supertest");
const app = require("../app");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');

describe("Payment API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should reject checkout creation without authentication", async () => {
    const response = await request(app)
      .post("/api/payments/create-checkout-session")
      .send({
        items: [
          {
            productId: "507f1f77bcf86cd799439011",
            name: "Test Product",
            price: 1000,
            qty: 1,
          },
        ],
        totalAmount: 1000,
        address: {},
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Not authorized, no token");
  });

  test("should reject checkout when cart is empty", async () => {
    const user = await User.create({
      name: "Payment User",
      email: "paymentuser@example.com",
      password: "hashedpassword",
      role: "user",
      verified: true,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const response = await request(app)
      .post("/api/payments/create-checkout-session")
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [],
        totalAmount: 0,
        address: {},
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Cart is empty");
  });

  test("should create checkout session successfully", async () => {
    const user = await User.create({
      name: "Checkout User",
      email: "checkout@example.com",
      password: "hashedpassword",
      role: "user",
      verified: true,
    });

    const product = await Product.create({
      name: "Test Laptop",
      description: "Test Laptop",
      price: 50000,
      category: "Electronics",
      stock: 10,
      imageUrl: "test.jpg",
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    mockStripe.checkout.sessions.create.mockResolvedValue({
      id: "cs_test_123",
      url: "https://checkout.stripe.com/test-session",
    });

    const response = await request(app)
      .post("/api/payments/create-checkout-session")
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [
          {
            productId: product._id,
            name: product.name,
            price: product.price,
            qty: 2,
          },
        ],
        totalAmount: 100000,
        address: {
          fullName: "Checkout User",
          street: "123 Main Street",
          city: "Yavatmal",
          postalCode: "445001",
          country: "India",
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.url).toBe("https://checkout.stripe.com/test-session");
    expect(response.body.orderId).toBeDefined();

    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledTimes(1);

    const savedOrder = await Order.findById(response.body.orderId);

    expect(savedOrder).not.toBeNull();
    expect(savedOrder.user.toString()).toBe(user._id.toString());
    expect(savedOrder.totalAmount).toBe(100000);
    expect(savedOrder.paymentStatus).toBe("pending");
  });

  test("should handle Stripe checkout session failure", async () => {
    const user = await User.create({
      name: "Stripe Error User",
      email: "stripeerror@example.com",
      password: "hashedpassword",
      role: "user",
      verified: true,
    });

    const product = await Product.create({
      name: "Error Product",
      description: "Test Product",
      price: 1000,
      category: "Electronics",
      stock: 5,
      imageUrl: "test.jpg",
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    mockStripe.checkout.sessions.create.mockRejectedValue(
      new Error("Stripe API failure"),
    );

    const response = await request(app)
      .post("/api/payments/create-checkout-session")
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [
          {
            productId: product._id,
            name: product.name,
            price: 1000,
            qty: 1,
          },
        ],
        totalAmount: 1000,
        address: {
          fullName: "Stripe Error User",
          street: "Street",
          city: "Yavatmal",
          postalCode: "445001",
          country: "India",
        },
      });

    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe("Unable to create checkout session");
  });

  test("should reject payment confirmation without session_id or orderId", async () => {
    const user = await User.create({
      name: "Confirm User",
      email: "confirm@example.com",
      password: "hashedpassword",
      role: "user",
      verified: true,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const response = await request(app)
      .get("/api/payments/confirm")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Missing session_id or orderId");
  });

  test("should reject unauthenticated payment confirmation", async () => {
    const response = await request(app).get("/api/payments/confirm").query({
      session_id: "cs_test_123",
      orderId: "507f1f77bcf86cd799439011",
    });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Not authorized, no token");
  });

  test("should confirm successful payment and decrease product stock", async () => {
    const user = await User.create({
      name: "Payment Confirm User",
      email: "paymentconfirm@example.com",
      password: "hashedpassword",
      role: "user",
      verified: true,
    });

    const product = await Product.create({
      name: "Confirm Product",
      description: "Test Product",
      price: 1000,
      category: "Electronics",
      stock: 10,
      imageUrl: "test.jpg",
    });

    const order = await Order.create({
      user: user._id,
      items: [
        {
          productId: product._id,
          quantity: 2,
          price: 1000,
        },
      ],
      totalAmount: 2000,
      address: {
        fullName: "Payment Confirm User",
        street: "Street",
        city: "Yavatmal",
        postalCode: "445001",
        country: "India",
      },
      paymentId: "pending_payment",
      paymentStatus: "pending",
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    mockStripe.checkout.sessions.retrieve.mockResolvedValue({
      id: "cs_test_paid",
      payment_status: "paid",
      payment_intent: "pi_test_123",
    });

    const response = await request(app)
      .get("/api/payments/confirm")
      .set("Authorization", `Bearer ${token}`)
      .query({
        session_id: "cs_test_paid",
        orderId: order._id.toString(),
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Payment confirmed");

    const updatedOrder = await Order.findById(order._id);

    expect(updatedOrder.paymentStatus).toBe("paid");
    expect(updatedOrder.paymentId).toBe("pi_test_123");

    const updatedProduct = await Product.findById(product._id);

    expect(updatedProduct.stock).toBe(8);
  });

  test("should not decrease stock again when payment is already confirmed", async () => {
    const user = await User.create({
      name: "Duplicate Payment User",
      email: "duplicatepayment@example.com",
      password: "hashedpassword",
      role: "user",
      verified: true,
    });

    const product = await Product.create({
      name: "Duplicate Test Product",
      description: "Test Product",
      price: 1000,
      category: "Electronics",
      stock: 10,
      imageUrl: "test.jpg",
    });

    const order = await Order.create({
      user: user._id,
      items: [
        {
          productId: product._id,
          quantity: 2,
          price: 1000,
        },
      ],
      totalAmount: 2000,
      address: {
        fullName: "Duplicate Payment User",
        street: "Street",
        city: "Yavatmal",
        postalCode: "445001",
        country: "India",
      },
      paymentStatus: "pending",
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    mockStripe.checkout.sessions.retrieve.mockResolvedValue({
      id: "cs_duplicate_test",
      payment_status: "paid",
      payment_intent: "pi_duplicate_123",
    });

    // First confirmation
    const firstResponse = await request(app)
      .get("/api/payments/confirm")
      .set("Authorization", `Bearer ${token}`)
      .query({
        session_id: "cs_duplicate_test",
        orderId: order._id.toString(),
      });

    expect(firstResponse.statusCode).toBe(200);

    let updatedProduct = await Product.findById(product._id);
    expect(updatedProduct.stock).toBe(8);

    // Second confirmation — simulates refresh/repeated request
    const secondResponse = await request(app)
      .get("/api/payments/confirm")
      .set("Authorization", `Bearer ${token}`)
      .query({
        session_id: "cs_duplicate_test",
        orderId: order._id.toString(),
      });

    expect(secondResponse.statusCode).toBe(200);

    updatedProduct = await Product.findById(product._id);

    // Stock must remain 8, NOT 6
    expect(updatedProduct.stock).toBe(8);

    const updatedOrder = await Order.findById(order._id);

    expect(updatedOrder.paymentStatus).toBe("paid");
    expect(updatedOrder.paymentId).toBe("pi_duplicate_123");
  });

  test('should reject payment when Stripe payment is not completed', async () => {
    const user = await User.create({
        name: 'Failed Payment User',
        email: 'failedpayment@example.com',
        password: 'hashedpassword',
        role: 'user',
        verified: true
    });

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    mockStripe.checkout.sessions.retrieve.mockResolvedValue({
        id: 'cs_unpaid_test',
        payment_status: 'unpaid'
    });

    const response = await request(app)
        .get('/api/payments/confirm')
        .set('Authorization', `Bearer ${token}`)
        .query({
            session_id: 'cs_unpaid_test',
            orderId: new mongoose.Types.ObjectId().toString()
        });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Payment not completed');
});

test('should return 404 when confirming payment for nonexistent order', async () => {
    const user = await User.create({
        name: 'Missing Order User',
        email: 'missingorder@example.com',
        password: 'hashedpassword',
        role: 'user',
        verified: true
    });

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    mockStripe.checkout.sessions.retrieve.mockResolvedValue({
        id: 'cs_missing_order',
        payment_status: 'paid',
        payment_intent: 'pi_missing_order'
    });

    const response = await request(app)
        .get('/api/payments/confirm')
        .set('Authorization', `Bearer ${token}`)
        .query({
            session_id: 'cs_missing_order',
            orderId: new mongoose.Types.ObjectId().toString()
        });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('Order not found');
});

test('should mark order payment as failed', async () => {
    const user = await User.create({
        name: 'Payment Fail User',
        email: 'paymentfail@example.com',
        password: 'hashedpassword',
        role: 'user',
        verified: true
    });

    const order = await Order.create({
        user: user._id,
        items: [],
        totalAmount: 1000,
        address: {
            fullName: 'Payment Fail User',
            street: 'Street',
            city: 'Yavatmal',
            postalCode: '445001',
            country: 'India'
        },
        paymentStatus: 'pending'
    });

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    const response = await request(app)
        .get('/api/payments/fail')
        .set('Authorization', `Bearer ${token}`)
        .query({
            orderId: order._id.toString()
        });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Payment marked as failed');

    const updatedOrder = await Order.findById(order._id);

    expect(updatedOrder.paymentStatus).toBe('failed');
}); 

test('should mark payment as failed even when orderId is missing', async () => {
    const user = await User.create({
        name: 'Fail Without Order User',
        email: 'failwithoutorder@example.com',
        password: 'hashedpassword',
        role: 'user',
        verified: true
    });

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    const response = await request(app)
        .get('/api/payments/fail')
        .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Payment marked as failed');
});
});
