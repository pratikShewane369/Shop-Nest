jest.mock("stripe", () => {
  return jest.fn(() => ({
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  }));
});

jest.mock("../config/cloudinary", () => ({
  uploader: {
    upload: jest.fn().mockResolvedValue({
      secure_url: "https://test-image.com/product.jpg",
    }),
  },
}));

const request = require("supertest");
const app = require("../app");
const Product = require("../models/productModel");

describe("Product API", () => {
  // 1. Get all products
  test("should get all products", async () => {
    await Product.create({
      name: "Test Product",
      description: "Test Description",
      price: 999,
      category: "Electronics",
      stock: 10,
      imageUrl: "test-image.jpg",
    });

    const response = await request(app).get("/api/products");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].name).toBe("Test Product");
  });

  // 2. Get all products when database is empty
  test("should return empty array when no products exist", async () => {
    const response = await request(app).get("/api/products");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  // 3. Get product by ID
  test("should get a product by ID", async () => {
    const product = await Product.create({
      name: "Laptop",
      description: "Test Laptop",
      price: 50000,
      category: "Electronics",
      stock: 5,
      imageUrl: "laptop.jpg",
    });

    const response = await request(app).get(`/api/products/${product._id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe("Laptop");
    expect(response.body.price).toBe(50000);
  });

  // 4. Product not found
  test("should return product not found when ID does not exist", async () => {
    const product = await Product.create({
      name: "Existing Product",
      description: "Test",
      price: 100,
      category: "Test",
      stock: 5,
      imageUrl: "test.jpg",
    });

    await Product.findByIdAndDelete(product._id);

    const response = await request(app).get(`/api/products/${product._id}`);

    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe("Product not found");
  });

  // 5. Invalid product ID
  test("should reject an invalid product ID", async () => {
    const response = await request(app).get("/api/products/invalid-id");

    expect(response.statusCode).toBe(500);
    expect(response.body.message).toContain("Server error");
  });

  // 6. Create product without image
  test("should reject product creation when image is missing", async () => {
    const response = await request(app).post("/api/products").send({
      name: "Test Product",
      description: "Test Description",
      price: 1000,
      category: "Electronics",
      stock: 10,
    });

    expect(response.statusCode).toBe(401);
  });

  // 7. Create product without authentication
  test("should reject product creation without authentication", async () => {
    const response = await request(app)
      .post("/api/products")
      .field("name", "Test Product")
      .field("description", "Test Description")
      .field("price", "1000")
      .field("category", "Electronics")
      .field("stock", "10");

    expect(response.statusCode).toBe(401);
  });

  // 8. Normal user cannot create product
  test("should reject product creation by normal user", async () => {
    const User = require("../models/userModel");
    const jwt = require("jsonwebtoken");

    const user = await User.create({
      name: "Normal User",
      email: "normal@example.com",
      password: "hashedpassword",
      role: "user",
      verified: true,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .field("name", "Test Product")
      .field("description", "Test Description")
      .field("price", "1000")
      .field("category", "Electronics")
      .field("stock", "10");

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe("Access denied, admin only");
  });

  // 9. Admin cannot create product without image
  test("should reject admin product creation without image", async () => {
    const User = require("../models/userModel");
    const jwt = require("jsonwebtoken");

    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "hashedpassword",
      role: "admin",
      verified: true,
    });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .field("name", "Test Product")
      .field("description", "Test Description")
      .field("price", "1000")
      .field("category", "Electronics")
      .field("stock", "10");

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Product image is required");
  });

  // 10. Admin can create a product
  test("should allow admin to create a product", async () => {
    const User = require("../models/userModel");
    const jwt = require("jsonwebtoken");

    const admin = await User.create({
      name: "Admin User",
      email: "createadmin@example.com",
      password: "hashedpassword",
      role: "admin",
      verified: true,
    });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .field("name", "Test Laptop")
      .field("description", "Test Laptop Description")
      .field("price", "50000")
      .field("category", "Electronics")
      .field("stock", "10")
      .attach("image", Buffer.from("fake image data"), "test.jpg");

    expect(response.statusCode).toBe(201);

    expect(response.body.message).toBe("Product saved successfully");

    expect(response.body.product.name).toBe("Test Laptop");

    expect(response.body.product.price).toBe(50000);

    expect(response.body.product.imageUrl).toBe(
      "https://test-image.com/product.jpg",
    );
  });

  // 11. Admin can update a product
  test("should allow admin to update a product", async () => {
    const User = require("../models/userModel");
    const jwt = require("jsonwebtoken");

    const admin = await User.create({
      name: "Update Admin",
      email: "updateadmin@example.com",
      password: "hashedpassword",
      role: "admin",
      verified: true,
    });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const product = await Product.create({
      name: "Old Product",
      description: "Old Description",
      price: 1000,
      category: "Electronics",
      stock: 10,
      imageUrl: "old-image.jpg",
    });

    const response = await request(app)
      .put(`/api/products/${product._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Product",
        price: 2000,
        stock: 20,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe("Updated Product");
    expect(response.body.price).toBe(2000);
    expect(response.body.stock).toBe(20);
  });

  // 12. Admin can delete a product
  test("should allow admin to delete a product", async () => {
    const User = require("../models/userModel");
    const jwt = require("jsonwebtoken");

    const admin = await User.create({
      name: "Delete Admin",
      email: "deleteadmin@example.com",
      password: "hashedpassword",
      role: "admin",
      verified: true,
    });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const product = await Product.create({
      name: "Delete Product",
      description: "Product to delete",
      price: 1000,
      category: "Electronics",
      stock: 10,
      imageUrl: "delete.jpg",
    });

    const response = await request(app)
      .delete(`/api/products/${product._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Product removed");

    const deletedProduct = await Product.findById(product._id);

    expect(deletedProduct).toBeNull();
  });

  // 13. Normal user cannot update a product
  test("should reject product update by normal user", async () => {
    const User = require("../models/userModel");
    const jwt = require("jsonwebtoken");

    const user = await User.create({
      name: "Normal User",
      email: "updateuser@example.com",
      password: "hashedpassword",
      role: "user",
      verified: true,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const product = await Product.create({
      name: "Original Product",
      description: "Original Description",
      price: 1000,
      category: "Electronics",
      stock: 10,
      imageUrl: "product.jpg",
    });

    const response = await request(app)
      .put(`/api/products/${product._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Hacked Product",
        price: 1,
      });

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe("Access denied, admin only");
  });

  // 14. Normal user cannot delete a product
  test("should reject product deletion by normal user", async () => {
    const User = require("../models/userModel");
    const jwt = require("jsonwebtoken");

    const user = await User.create({
      name: "Normal User",
      email: "deleteuser@example.com",
      password: "hashedpassword",
      role: "user",
      verified: true,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const product = await Product.create({
      name: "Protected Product",
      description: "Protected Description",
      price: 1000,
      category: "Electronics",
      stock: 10,
      imageUrl: "product.jpg",
    });

    const response = await request(app)
      .delete(`/api/products/${product._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe("Access denied, admin only");
  });

  // 15. Update nonexistent product
  test("should return 404 when updating nonexistent product", async () => {
    const User = require("../models/userModel");
    const jwt = require("jsonwebtoken");

    const admin = await User.create({
      name: "Update Admin",
      email: "missingupdate@example.com",
      password: "hashedpassword",
      role: "admin",
      verified: true,
    });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const fakeId = new (require("mongoose").Types.ObjectId)();

    const response = await request(app)
      .put(`/api/products/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Product",
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Product not found");
  });

  // 16. Delete nonexistent product
  test("should return 404 when deleting nonexistent product", async () => {
    const User = require("../models/userModel");
    const jwt = require("jsonwebtoken");

    const admin = await User.create({
      name: "Delete Admin",
      email: "missingdelete@example.com",
      password: "hashedpassword",
      role: "admin",
      verified: true,
    });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const fakeId = new (require("mongoose").Types.ObjectId)();

    const response = await request(app)
      .delete(`/api/products/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Product not found");
  });
});
