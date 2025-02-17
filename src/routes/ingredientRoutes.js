const express = require("express");
const router = express.Router();
const ingredientController = require("../controller/IngredientController");
const {
  authMiddleware,
  authenticateToken,
} = require("../middleware/authmiddleware");

router.post("/", authenticateToken, ingredientController.createIngredient);

router.get("/", ingredientController.getAllIngredients);
router.get("/:id", ingredientController.getIngredientById);

router.put("/:id", authMiddleware, ingredientController.updateIngredient);
router.delete("/:id", authenticateToken, ingredientController.deleteIngredient);

module.exports = router;
