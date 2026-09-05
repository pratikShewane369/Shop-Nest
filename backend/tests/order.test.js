const request = require("supertest");
const app = require("../app");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');

jest.mock("../utils/sendEmail", () => jest.fn());

describe("Order API", () => {
  // 1. Create order with authenticated user
  test("should create an order successfully", async () => {
    const user = await User.create({
      name: "Order User",
      email: "orderuser@example.com",
      password: "hashedpassword",
      role: "user",
      verified: true,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const product = await Product.create({
      name: "Test Product",
      description: "Test Description",
      price: 1000,
      category: "Electronics",
      stock: 10,
      imageUrl: "test.jpg",
    });

    const orderData = {
      items: [
        {
          productId: product._id,
          quantity: 2,
          price: 1000,
        },
      ],
      totalAmount: 2000,
      address: {
        fullName: "Order User",
        street: "123 Main Street",
        city: "Yavatmal",
        postalCode: "445001",
        country: "India",
      },
      paymentId: "test_payment_123",
    };

    const response = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send(orderData);

    expect(response.statusCode).toBe(201);

    expect(response.body.message).toBe("Order created successfully");

    expect(response.body.order).toBeDefined();
    expect(response.body.order.user.toString()).toBe(user._id.toString());

    expect(response.body.order.totalAmount).toBe(2000);

    expect(response.body.order.paymentId).toBe("test_payment_123");

    expect(response.body.order.status).toBe("pending");
  });

  // 2. Reject order without authentication
  test("should reject order creation without authentication", async () => {
    const response = await request(app)
      .post("/api/orders")
      .send({
        items: [],
        totalAmount: 1000,
        address: {
          fullName: "Test User",
          street: "Street",
          city: "City",
          postalCode: "123456",
          country: "India",
        },
        paymentId: "payment123",
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Not authorized, no token");
  });

  // 3. Reject invalid order data
  test("should reject order with invalid order data", async () => {
    const user = await User.create({
      name: "Invalid Order User",
      email: "invalidorder@example.com",
      password: "hashedpassword",
      role: "user",
      verified: true,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const response = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [],
        totalAmount: 1000,
        address: {},
        paymentId: "payment123",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid Order Data");
  });

  // 4. Verify order is saved in database
  test("should save the created order in database", async () => {
    const user = await User.create({
      name: "Database User",
      email: "databaseorder@example.com",
      password: "hashedpassword",
      role: "user",
      verified: true,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const product = await Product.create({
      name: "Database Product",
      description: "Test Product",
      price: 500,
      category: "Electronics",
      stock: 5,
      imageUrl: "test.jpg",
    });

    const response = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [
          {
            productId: product._id,
            quantity: 1,
            price: 500,
          },
        ],
        totalAmount: 500,
        address: {
          fullName: "Database User",
          street: "Test Street",
          city: "Yavatmal",
          postalCode: "445001",
          country: "India",
        },
        paymentId: "payment_db_123",
      });

    expect(response.statusCode).toBe(201);

    const savedOrder = await Order.findById(response.body.order._id);

    expect(savedOrder).not.toBeNull();
    expect(savedOrder.totalAmount).toBe(500);
    expect(savedOrder.paymentId).toBe("payment_db_123");
  });

  test("should return orders for authenticated user", async () => {
    const user = await User.create({
      name: "My Orders User",
      email: "myorders@example.com",
      password: "hashedpassword",
      role: "user",
      verified: true,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    await Order.create({
      user: user._id,
      items: [],
      totalAmount: 1000,
      address: {
        fullName: "My Orders User",
        street: "Street 1",
        city: "Yavatmal",
        postalCode: "445001",
        country: "India",
      },
      paymentId: "payment_1",
      status: "pending",
    });

    const response = await request(app)
      .get("/api/orders/myorders")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].totalAmount).toBe(1000);
    expect(response.body[0].status).toBe("pending");
  });

  test("should return orders sorted by newest first", async () => {
    const user = await User.create({
      name: "Sorting User",
      email: "sorting@example.com",
      password: "hashedpassword",
      role: "user",
      verified: true,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    await Order.create({
      user: user._id,
      items: [],
      totalAmount: 1000,
      address: {
        fullName: "Sorting User",
        street: "Street",
        city: "Yavatmal",
        postalCode: "445001",
        country: "India",
      },
      paymentId: "old_payment",
    });

    await new Promise((resolve) => setTimeout(resolve, 20));

    await Order.create({
      user: user._id,
      items: [],
      totalAmount: 2000,
      address: {
        fullName: "Sorting User",
        street: "Street",
        city: "Yavatmal",
        postalCode: "445001",
        country: "India",
      },
      paymentId: "new_payment",
    });

    const response = await request(app)
      .get("/api/orders/myorders")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);

    expect(response.body[0].totalAmount).toBe(2000);
    expect(response.body[1].totalAmount).toBe(1000);
  });

  test("should reject unauthenticated user from viewing orders", async () => {
    const response = await request(app).get("/api/orders/myorders");

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Not authorized, no token");
  });

  test("should not return another user's orders", async () => {
    const user1 = await User.create({
      name: "User One",
      email: "userone@example.com",
      password: "hashedpassword",
      role: "user",
      verified: true,
    });

    const user2 = await User.create({
      name: "User Two",
      email: "usertwo@example.com",
      password: "hashedpassword",
      role: "user",
      verified: true,
    });

    const token = jwt.sign({ id: user1._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    await Order.create({
      user: user1._id,
      items: [],
      totalAmount: 1000,
      address: {
        fullName: "User One",
        street: "Street",
        city: "Yavatmal",
        postalCode: "445001",
        country: "India",
      },
      paymentId: "user1_payment",
    });

    await Order.create({
      user: user2._id,
      items: [],
      totalAmount: 5000,
      address: {
        fullName: "User Two",
        street: "Street",
        city: "Yavatmal",
        postalCode: "445001",
        country: "India",
      },
      paymentId: "user2_payment",
    });

    const response = await request(app)
      .get("/api/orders/myorders")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);

    expect(response.body[0].totalAmount).toBe(1000);
    expect(response.body[0].paymentId).toBeUndefined();
  });

  test("should allow admin to get all orders", async () => {
    const admin = await User.create({
      name: "Admin User",
      email: "adminorders@example.com",
      password: "hashedpassword",
      role: "admin",
      verified: true,
    });

    const user = await User.create({
      name: "Customer",
      email: "customer@example.com",
      password: "hashedpassword",
      role: "user",
      verified: true,
    });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    await Order.create({
      user: user._id,
      items: [],
      totalAmount: 1500,
      address: {
        fullName: "Customer",
        street: "Street",
        city: "Yavatmal",
        postalCode: "445001",
        country: "India",
      },
      paymentId: "payment_admin_test",
    });

    const response = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].totalAmount).toBe(1500);
    expect(response.body[0].user.name).toBe("Customer");
  });

  test("should reject normal user from getting all orders", async () => {
    const user = await User.create({
      name: "Normal User",
      email: "normalorders@example.com",
      password: "hashedpassword",
      role: "user",
      verified: true,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const response = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe("Access denied, admin only");
  });

  test("should reject unauthenticated user from getting all orders", async () => {
    const response = await request(app).get("/api/orders");

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Not authorized, no token");
  });

  test("should return empty array when admin gets orders and no orders exist", async () => {
    const admin = await User.create({
      name: "Empty Orders Admin",
      email: "emptyadmin@example.com",
      password: "hashedpassword",
      role: "admin",
      verified: true,
    });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const response = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("should allow admin to update order status", async () => {
    const admin = await User.create({
      name: "Admin",
      email: "statusadmin@example.com",
      password: "hashedpassword",
      role: "admin",
      verified: true,
    });

    const user = await User.create({
      name: "Customer",
      email: "statususer@example.com",
      password: "hashedpassword",
      role: "user",
      verified: true,
    });

    const order = await Order.create({
      user: user._id,
      items: [],
      totalAmount: 2000,
      address: {
        fullName: "Customer",
        street: "Street",
        city: "Yavatmal",
        postalCode: "445001",
        country: "India",
      },
      paymentId: "payment_status_test",
    });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const response = await request(app)
      .put(`/api/orders/${order._id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "shipped" });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Order status updated successfully");
    expect(response.body.order.status).toBe("shipped");

    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder.status).toBe("shipped");
  });

  test("should reject normal user from updating order status", async () => {
    const user = await User.create({
      name: "Normal User",
      email: "normalstatus@example.com",
      password: "hashedpassword",
      role: "user",
      verified: true,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const order = await Order.create({
      user: user._id,
      items: [],
      totalAmount: 1000,
      address: {
        fullName: "Normal User",
        street: "Street",
        city: "Yavatmal",
        postalCode: "445001",
        country: "India",
      },
      paymentId: "payment_user_test",
    });

    const response = await request(app)
      .put(`/api/orders/${order._id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "delivered" });

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe("Access denied, admin only");
  });

  test("should reject unauthenticated user from updating order status", async () => {
    const order = await Order.create({
      user: new mongoose.Types.ObjectId(),
      items: [],
      totalAmount: 1000,
      address: {
        fullName: "Test User",
        street: "Street",
        city: "Yavatmal",
        postalCode: "445001",
        country: "India",
      },
      paymentId: "payment_test",
    });

    const response = await request(app)
      .put(`/api/orders/${order._id}/status`)
      .send({ status: "shipped" });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Not authorized, no token");
  });

  test("should return 404 when updating nonexistent order", async () => {
    const admin = await User.create({
      name: "Admin",
      email: "nonexistentadmin@example.com",
      password: "hashedpassword",
      role: "admin",
      verified: true,
    });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const fakeOrderId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .put(`/api/orders/${fakeOrderId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "shipped" });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Order not found");
  });
});
