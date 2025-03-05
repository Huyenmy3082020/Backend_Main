const express = require("express");
const router = express.Router();
const InventoryController = require("../controller/InventoryController");
const {
    authenticateToken,
} = require("../middleware/authmiddleware"); 

router.post("/", authenticateToken, InventoryController.createInventory);
router.get("/:id", authenticateToken, InventoryController.getInventory);
router.get("/", authenticateToken, InventoryController.getAll);
router.put("/:inventoryId",  authenticateToken, InventoryController.updateInventory);
router.delete("/:inventoryId",authenticateToken, InventoryController.deleteInventory);

module.exports = router;
