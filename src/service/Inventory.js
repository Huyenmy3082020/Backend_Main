const Inventory = require("../models/inventory.model");

// 🔹 Thêm hàng vào kho
async function addInventory({ stock, productId, userId, status, location }) {
  return await Inventory.create({
    stock,
    productId,
    userId,
    status,
    location,
  });
}

// 🔹 Lấy danh sách tồn kho (có thể lọc theo productId)
async function getInventory(productId = null) {
  const query = productId ? { productId } : {};
  return await Inventory.find(query).populate("productId").populate("userId");
}

// 🔹 Cập nhật kho theo inventoryId
async function updateInventory(inventoryId, updateData) {
  return await Inventory.findByIdAndUpdate(inventoryId, updateData, {
    new: true,
  });
}

// 🔹 Xóa kho theo inventoryId
async function deleteInventory(inventoryId) {
  return await Inventory.findByIdAndDelete(inventoryId);
}

module.exports = {
  addInventory,
  getInventory,
  updateInventory,
  deleteInventory,
};
