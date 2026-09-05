const request = require("supertest");
const app = require("../app");

jest.mock("../utils/sendEmail", () => jest.fn());

describe("Authentication API", () => {
  test("should register a new user", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "123456",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.name).toBe("Test User");
    expect(response.body.email).toBe("test@example.com");
    expect(response.body.message).toBe(
      "Registration successful. OTP sent to your email.",
    );
  });

  test("should reject registration when required fields are missing", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "123456",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("All fields are required");
  });

  test("should reject registration with an existing email", async () => {
    await request(app).post("/api/auth/register").send({
      name: "First User",
      email: "duplicate@example.com",
      password: "123456",
    });

    const response = await request(app).post("/api/auth/register").send({
      name: "Second User",
      email: "duplicate@example.com",
      password: "123456",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("User already exists");
  });

  test("should reject registration when name is missing", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "noname@example.com",
      password: "123456",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("All fields are required");
  });

  test("should reject registration when email is missing", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "No Email User",
      password: "123456",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("All fields are required");
  });

  test("should reject registration when password is missing", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "No Password User",
      email: "nopassword@example.com",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("All fields are required");
  });

  // 7. Verify user with valid OTP
  test("should verify user with a valid OTP", async () => {
    const email = "verify@example.com";

    // Register user first
    await request(app).post("/api/auth/register").send({
      name: "Verify User",
      email,
      password: "123456",
    });

    // Get OTP directly from test database
    const OTP = require("../models/otpModel");

    const otpRecord = await OTP.findOne({ email });

    const response = await request(app).post("/api/auth/verify").send({
      email,
      otp: otpRecord.otp,
    });

    expect(response.statusCode).toBe(200);

    expect(response.body.message).toBe(
      "Account Verified Successfully. You Can Login.",
    );

    expect(response.body.email).toBe(email);

    expect(response.body.token).toBeDefined();
  });

  // Invalid OTP
  test("should reject an invalid OTP", async () => {
    const email = "invalidotp@example.com";

    await request(app).post("/api/auth/register").send({
      name: "Invalid OTP User",
      email,
      password: "123456",
    });

    const response = await request(app).post("/api/auth/verify").send({
      email,
      otp: "000000",
    });

    expect(response.statusCode).toBe(400);

    expect(response.body.error).toBe("Invalid or Expired OTP");
  });

  // Missing email or OTP
  test("should reject OTP verification when email or OTP is missing", async () => {
    const response = await request(app).post("/api/auth/verify").send({
      email: "missingotp@example.com",
    });

    expect(response.statusCode).toBe(400);

    expect(response.body.message).toBe("Email and OTP are required");
  });

  // Protected route without token
  test("should reject access to protected route without token", async () => {
    const response = await request(app).get("/api/auth/users");

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Not authorized, no token");
  });

  // Protected route with invalid token
  test("should reject access with invalid token", async () => {
    const response = await request(app)
      .get("/api/auth/users")
      .set("Authorization", "Bearer invalidtoken");

    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe("Not authorized, no token");
  });

  // Normal user cannot access admin route
  test("should reject normal user from admin route", async () => {
    const email = "normaluser@example.com";

    await request(app).post("/api/auth/register").send({
      name: "Normal User",
      email,
      password: "123456",
    });

    const OTP = require("../models/otpModel");
    const otpRecord = await OTP.findOne({ email });

    const verifyResponse = await request(app).post("/api/auth/verify").send({
      email,
      otp: otpRecord.otp,
    });

    const token = verifyResponse.body.token;

    const response = await request(app)
      .get("/api/auth/users")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe("Access denied, admin only");
  });

  //13 Admin can access admin route
  test("should allow admin user to access admin route", async () => {
    const User = require("../models/userModel");

    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "hashedpassword",
      role: "admin",
      verified: true,
    });

    const jwt = require("jsonwebtoken");

    const token = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const response = await request(app)
      .get("/api/auth/users")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
  
});
