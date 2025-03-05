const express = require("express");
const router = express.Router();
const categoryController = require("../controller/CategoryController");
const {
    authenticateToken,
  } = require("../middleware/authmiddleware");
  
router.post("/", authenticateToken, categoryController.createCategory); // Thêm mới
router.get("/", authenticateToken, categoryController.getAllCategories); // Lấy tất cả
router.get("/:id", authenticateToken, categoryController.getCategoryById); // Lấy theo ID
router.put("/:id", authenticateToken, categoryController.updateCategory); // Cập nhật
router.delete("/:id",authenticateToken, categoryController.deleteCategory); // Xóa

module.exports = router;
