const express = require("express");
const router = express.Router();
const categoryController = require("../controller/CategoryController");
const {
  authenticateToken,
  authenticateIsAdmin,
} = require("../middleware/authmiddleware");

router.post("/", categoryController.createCategory); // Thêm mới
router.get("/", authenticateToken, categoryController.getAllCategories); // Lấy tất cả
router.get("/:id", categoryController.getCategoryById); // Lấy theo ID
router.put("/:id", categoryController.updateCategory); // Cập nhật
router.delete("/:id", categoryController.deleteCategory); // Xóa

module.exports = router;
