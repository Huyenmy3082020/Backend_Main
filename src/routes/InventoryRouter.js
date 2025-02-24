const express = require("express");
const router = express.Router();
const InventoryController = require("../controller/InventoryController");

router.post("/", InventoryController.createInventory);
router.get("/:id", InventoryController.getInventory);
router.get("/", InventoryController.getAll);
router.put("/:inventoryId", InventoryController.updateInventory);
router.delete("/:inventoryId", InventoryController.deleteInventory);

module.exports = router;
