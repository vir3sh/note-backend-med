const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

// Protects routes: expects "Authorization: Bearer <token>"
module.exports = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new AppError(401, "Not authenticated");

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }

  const user = await User.findById(payload.id);
  if (!user) throw new AppError(401, "User no longer exists");

  req.user = user;
  next();
});
