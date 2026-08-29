const User = require("../models/userModel");
const OTP = require("../models/otpModel");
const sendEmail = require("../utils/sendEmail");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// =========================
// REGISTER USER
// =========================
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      verified: false,
    });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove any old OTP for this email
    await OTP.deleteMany({ email });

    // Save new OTP
    await OTP.create({
      email,
      otp,
    });

    const message = `
      <h2>Welcome to ShopNest, ${name}!</h2>
      <p>Your OTP for ShopNest registration is:</p>
      <h1>${otp}</h1>
      <p>Please use this OTP to verify your account.</p>
    `;

    // Send OTP
    await sendEmail({
      email,
      subject: "Welcome to ShopNest - Your OTP for Registration",
      message,
    });

    return res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      message: "Registration successful. OTP sent to your email.",
    });

  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      message: `Server Error: ${error.message}`,
    });
  }
};


// =========================
// LOGIN USER
// =========================
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // User doesn't exist
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // ==========================================
    // IMPORTANT:
    // User exists and password is correct,
    // but account is not verified
    // ==========================================
    if (!user.verified) {
      // Generate NEW OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Delete previous OTP
      await OTP.deleteMany({ email });

      // Save new OTP
      await OTP.create({
        email,
        otp,
      });

      const message = `
        <h2>Hello ${user.name}!</h2>
        <p>Your new OTP for ShopNest account verification is:</p>
        <h1>${otp}</h1>
        <p>Please enter this OTP to verify your account.</p>
      `;

      // Send new OTP
      await sendEmail({
        email,
        subject: "ShopNest - New OTP for Account Verification",
        message,
      });

      // DO NOT generate login token here
      return res.status(403).json({
        message: "Your account is not verified. A new OTP has been sent to your email.",
        needsVerification: true,
        email: user.email,
      });
    }

    // ==========================================
    // VERIFIED USER
    // ==========================================
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: `Server Error: ${error.message}`,
    });
  }
};


// =========================
// GET ALL USERS
// =========================
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");

    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};


// =========================
// VERIFY USER OTP
// =========================
const verifyUser = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    // Find OTP
    const otpRecord = await OTP.findOne({
      email,
      otp,
    });

    if (!otpRecord) {
      return res.status(400).json({
        error: "Invalid or Expired OTP",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Mark user as verified
    user.verified = true;

    await user.save();

    // Delete all OTPs belonging to this email
    await OTP.deleteMany({ email });

    // Return login information
    return res.status(200).json({
      message: "Account Verified Successfully. You Can Login.",
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("OTP verification error:", error);

    return res.status(500).json({
      message: `Server Error: ${error.message}`,
    });
  }
};


module.exports = {
  registerUser,
  loginUser,
  getUsers,
  verifyUser,
};