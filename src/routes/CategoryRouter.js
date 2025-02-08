const express = require("express");
const router = express.Router();
const categoryController = require("../controller/CategoryController");

router.post("/", categoryController.createCategory); // Thêm mới
router.get("/", categoryController.getAllCategories); // Lấy tất cả
router.get("/:id", categoryController.getCategoryById); // Lấy theo ID
router.put("/:id", categoryController.updateCategory); // Cập nhật
router.delete("/:id", categoryController.deleteCategory); // Xóa

module.exports = router;
