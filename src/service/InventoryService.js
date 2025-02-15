const { default: mongoose } = require("mongoose");
const Inventory = require("../models/InventoryModel");

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
async function getInventoryById(ingredientsId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(ingredientsId)) {
      throw new Error("Invalid ingredientsId");
    }

    const data = await Inventory.aggregate([
      { $match: { ingredientsId: new mongoose.Types.ObjectId(ingredientsId) } },
      {
        $group: {
          _id: "$ingredientsId",
          totalStock: { $sum: "$stock" },
          statusList: { $addToSet: "$status" },
        },
      },
      {
        $lookup: {
          from: "ingredients",
          localField: "_id",
          foreignField: "_id",
          as: "ingredientInfo",
        },
      },
      { $unwind: "$ingredientInfo" },
      {
        $project: {
          _id: 1,
          ingredientName: "$ingredientInfo.name",
          totalStock: 1,
          statusList: 1,
        },
      },
    ]);

    if (!data.length) {
      throw new Error("Không tìm thấy sản phẩm trong kho");
    }

    return data[0]; // Trả về object thay vì array
  } catch (error) {
    throw new Error(error.message);
  }
}

async function updateInventory(inventoryId, updateData) {
  return await Inventory.findByIdAndUpdate(inventoryId, updateData, {
    new: true,
  });
}

async function deleteInventory(inventoryId) {
  return await Inventory.findByIdAndDelete(inventoryId);
}

module.exports = {
  addInventory,
  updateInventory,
  deleteInventory,
  getInventoryById,
};
