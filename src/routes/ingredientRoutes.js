const express = require("express");
const router = express.Router();
const ingredientController = require("../controller/IngredientController");
const {
  authMiddleware,
  authUserMiddleware,
} = require("../middleware/authmiddleware");

router.post("/", authUserMiddleware, ingredientController.createIngredient); // Thêm mới
router.get("/", authUserMiddleware, ingredientController.getAllIngredients); // Lấy tất cả
router.get("/:id", ingredientController.getIngredientById); // Lấy theo ID
router.put("/:id", authMiddleware, ingredientController.updateIngredient); // Cập nhật
router.delete("/:id", authMiddleware, ingredientController.deleteIngredient); // Xóa

module.exports = router;
