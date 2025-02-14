const InventoryService = require("../service/InventoryService");

async function createInventory(req, res) {
  try {
    const data = await InventoryService.addInventory(req.body);
    res.status(201).json({ message: "Inventory created", data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function getInventory(req, res) {
  try {
    const { id } = req.params; // Nhận `id` từ URL (thống nhất với router)
    console.log("Received ingredientsId:", id);

    const data = await InventoryService.getInventoryById(id);

    res.status(200).json({ message: "Inventory Info", data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function updateInventory(req, res) {
  try {
    const { inventoryId } = req.params;
    const data = await InventoryService.updateInventory(inventoryId, req.body);
    res.status(200).json({ message: "Inventory updated", data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function deleteInventory(req, res) {
  try {
    const { inventoryId } = req.params;
    await InventoryService.deleteInventory(inventoryId);
    res.status(200).json({ message: "Inventory deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = {
  createInventory,
  getInventory,
  updateInventory,
  deleteInventory,
};
