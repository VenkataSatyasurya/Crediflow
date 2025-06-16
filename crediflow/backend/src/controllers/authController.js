import mongoose from "mongoose";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "crediflow_secret", {
    expiresIn: "7d",
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        field: "general",
        message: "Database is not connected. Please ensure MongoDB is running or update MONGO_URI in backend/.env."
      });
    }

    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ 
        field: "name", 
        message: "Please enter your full name." 
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ 
        field: "email", 
        message: "Email address is required." 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ 
        field: "email", 
        message: "Please enter a valid email address (e.g. alex@example.com)." 
      });
    }

    if (!password) {
      return res.status(400).json({ 
        field: "password", 
        message: "Password is required." 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        field: "password", 
        message: "Password must be at least 6 characters long." 
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ 
        field: "email",
        message: "An account with this email already exists. Please log in instead." 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "customer", // enforce default role
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        field: "email", 
        message: "An account with this email already exists. Please log in instead." 
      });
    }
    res.status(500).json({ 
      field: "general",
      message: "We encountered an issue creating your account. Please check your details and try again." 
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        field: "general",
        message: "Database is not connected. Please ensure MongoDB is running or update MONGO_URI in backend/.env."
      });
    }

    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ 
        field: "email", 
        message: "Email address is required." 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ 
        field: "email", 
        message: "Please enter a valid email address format (e.g. alex@example.com)." 
      });
    }

    if (!password) {
      return res.status(400).json({ 
        field: "password", 
        message: "Password is required." 
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ 
        field: "email",
        message: "No account found with this email address. Please register or check for typos." 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        field: "password", 
        message: "Incorrect password. Please verify your password and try again." 
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      field: "general",
      message: "Unable to verify credentials right now. Please try again shortly." 
    });
  }
};

