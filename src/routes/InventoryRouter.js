const express = require("express");
const router = express.Router();
const InventoryController = require("../controller/InventoryController");

router.post("/", InventoryController.createInventory);

router.get("/", InventoryController.getInventory);

router.put("/:inventoryId", InventoryController.updateInventory);

router.delete("/:inventoryId", InventoryController.deleteInventory);

module.exports = router;
