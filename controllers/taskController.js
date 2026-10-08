const { isValidObjectId } = require("mongoose");
const Task = require("../models/Task");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const STATUSES = ["pending", "completed"];

const checkId = (id) => {
  if (!isValidObjectId(id)) throw new AppError(400, "Invalid task id");
};

// POST /tasks
exports.createTask = asyncHandler(async (req, res) => {
  const title = req.body.title?.trim();
  const description = req.body.description?.trim() || "";
  if (!title) throw new AppError(400, "Title is required");

  const task = await Task.create({ user: req.user.id, title, description });
  res.status(201).json({ data: task });
});

// GET /tasks?status=pending&page=1&limit=10
exports.getTasks = asyncHandler(async (req, res) => {
  const { status } = req.query;
  if (status && !STATUSES.includes(status)) throw new AppError(400, "Invalid status filter");

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const filter = { user: req.user.id, ...(status && { status }) };

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  res.json({
    data: tasks,
    meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
});

// PATCH /tasks/:id  (body.status optional, defaults to "completed")
exports.updateTask = asyncHandler(async (req, res) => {
  checkId(req.params.id);
  const status = req.body.status || "completed";
  if (!STATUSES.includes(status)) throw new AppError(400, "Invalid status");

  const task = await Task.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { status }, { new: true });
  if (!task) throw new AppError(404, "Task not found");
  res.json({ data: task });
});

// DELETE /tasks/:id
exports.deleteTask = asyncHandler(async (req, res) => {
  checkId(req.params.id);
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!task) throw new AppError(404, "Task not found");
  res.status(204).send();
});
