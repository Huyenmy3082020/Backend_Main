const express = require("express");
const router = express.Router();
const ingredientController = require("../controller/IngredientController");
const {
  authenticateToken,
  authenticateIsAdmin,
} = require("../middleware/authmiddleware");

router.post("/", authenticateIsAdmin, ingredientController.createIngredient);
router.post(
  "/elasticsearch",
  ingredientController.createIngredientElastisearch
);
router.get("/", ingredientController.getAllIngredients);
router.get("/search", ingredientController.searchIngredients);
router.get("/:id", ingredientController.getIngredientById);

router.put("/:id", authenticateIsAdmin, ingredientController.updateIngredient);
router.delete("/:id", authenticateToken, ingredientController.deleteIngredient);

module.exports = router;
