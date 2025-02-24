const { default: mongoose } = require("mongoose");
const Inventory = require("../models/InventoryModel");
const Ingredient = require("../models/IngredientsModel");

// 🔹 Thêm hàng vào kho
async function addInventory({
  stock,
  productId,
  unit,
  userId,
  status,
  location,
}) {
  return await Inventory.create({
    stock,
    productId,
    userId,
    status,
    unit,
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
  } catch (error) {}
}

async function updateInventory(inventoryId, updateData) {
  return await Inventory.findByIdAndUpdate(inventoryId, updateData, {
    new: true,
  });
}

async function deleteInventory(inventoryId) {
  return await Inventory.findByIdAndDelete(inventoryId);
}
async function getAllInventoryWithIngredients() {
  try {
    const data = await Ingredient.aggregate([
      {
        $lookup: {
          from: "inventories",
          localField: "_id",
          foreignField: "ingredientsId",
          as: "inventoryData",
        },
      },
      {
        $addFields: {
          totalStock: {
            $ifNull: [{ $sum: "$inventoryData.stock" }, 0],
          },
          statusList: {
            $cond: {
              if: { $gt: [{ $size: "$inventoryData" }, 0] },
              then: { $setUnion: ["$inventoryData.status"] },
              else: ["Không có dữ liệu"],
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          unit: 1,
          description: 1,
          status: 1,
          categoryId: 1,
          supplierId: 1,
          totalStock: 1,
          statusList: 1,
        },
      },
    ]);

    return data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    return { error: error.message };
  }
}

module.exports = {
  addInventory,
  updateInventory,
  deleteInventory,
  getInventoryById,
  getAllInventoryWithIngredients,
};
