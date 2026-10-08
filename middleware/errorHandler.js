const AppError = require("../utils/AppError");

exports.notFound = (req, _res, next) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, _req, res, _next) => {
  let status = 500;
  let message = "Internal server error";

  if (err instanceof AppError) {
    status = err.statusCode;
    message = err.message;
  } else if (err.code === 11000) {
    status = 409;
    message = "Email is already registered";
  } else if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)[0].message;
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON body";
  } else {
    console.error(err);
  }

  res.status(status).json({ error: { message } });
};
