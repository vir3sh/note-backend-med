const router = require("express").Router();
const { createTask, getTasks, updateTask, deleteTask } = require("../controllers/taskController");
const protect = require("../middleware/auth");

router.use(protect); // every task route requires login

router.post("/", createTask);
router.get("/", getTasks);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;
