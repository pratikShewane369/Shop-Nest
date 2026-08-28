const User = require("../models/userModel");
const OTP = require("../models/otpModel");
const sendEmail = require("../utils/sendEmail");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
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
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      // console.log(`otp for ${email} : ${otp}`);
      await OTP.create({email, otp});
      const message = `
            Welcome to ShopMate, ${name} 
            Your OTP for ShopNest registration is : ${otp}`;

           await sendEmail({
           email,
           subject: "Welcome to ShopeNest - Your OTP for Registration",
           message,
           });

      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token: generateToken(newUser._id)
      });
    } else {
      res.status(400).json({
        message: "Invalid user data",
      });
    }
    // await newUser.save();
    // res.status(201).json({message : 'User Register Successfully'})
  } catch (error) {
    res.status(500).json({ message: `Server Error : ${error}` });
  }
};
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    res.status(500).json({
      message: `Server Error : ${err}`,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

const verifyUser = async(req, res) => {
    const {email, otp} = req.body;
    const otpRecord = await OTP.findOne({email, otp});

    if(!otpRecord) {
        return res.status(400).json({
            error : 'Invalid or Expired OTP'
        })
    }

    const user = await User.findOneAndUpdate({email}, {verified: true});
    await OTP.deleteMany({email}); // Remove Used OTP
    res.json({
        message : 'Account Verified Successfully, You Can Login',
        _id : user._id,
        name : user.name,
        email : user.email,
        token : generateToken(user._id, user.role)
    })
}
module.exports = {
  registerUser,
  loginUser,
  getUsers,
  verifyUser
};
