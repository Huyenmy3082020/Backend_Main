const express = require("express");
const router = express.Router();
const InventoryController = require("../controller/InventoryController");
const {
  authenticateToken,
  authenticateIsAdmin,
} = require("../middleware/authmiddleware");

router.post("/", InventoryController.createInventory);
router.get("/:id", authenticateToken, InventoryController.getInventory);
router.get("/", authenticateToken, InventoryController.getAll);
router.put("/:inventoryId", InventoryController.updateInventory);
router.delete("/:inventoryId", InventoryController.deleteInventory);

module.exports = router;
