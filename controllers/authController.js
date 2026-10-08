const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sendAuth = (res, status, user) => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.status(status).json({ data: { user, token } });
};

// POST /auth/signup
exports.signup = asyncHandler(async (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  if (!name) throw new AppError(400, "Name is required");
  if (!email || !EMAIL_RE.test(email)) throw new AppError(400, "A valid email is required");
  if (!password || password.length < 6) throw new AppError(400, "Password must be at least 6 characters");

  if (await User.findOne({ email })) throw new AppError(409, "Email is already registered");

  const user = await User.create({ name, email, password });
  sendAuth(res, 201, user);
});

// POST /auth/login
exports.login = asyncHandler(async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;
  if (!email || !password) throw new AppError(400, "Email and password are required");

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError(401, "Invalid email or password");
  }
  sendAuth(res, 200, user);
});

// GET /auth/me  -> used by the frontend to check if the user is logged in
exports.me = (req, res) => {
  res.json({ data: { user: req.user } });
};
