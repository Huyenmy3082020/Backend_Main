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
      { $match: { isDeleted: false } }, // Chỉ lấy nguyên liệu chưa bị xóa

      {
        $lookup: {
          from: "inventories",
          localField: "_id",
          foreignField: "ingredientsId",
          as: "inventoryData",
        },
      },
      {
        $lookup: {
          from: "categories",
          let: { categoryId: "$categoryId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$categoryId"] },
                    { $eq: ["$isDeleted", false] },
                  ],
                },
              },
            },
          ],
          as: "categoryData",
        },
      },
      {
        $lookup: {
          from: "suppliers",
          let: { supplierId: "$supplierId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$supplierId"] },
                    { $eq: ["$isDeleted", false] },
                  ],
                },
              },
            },
          ],
          as: "supplierData",
        },
      },
      {
        $addFields: {
          category: { $arrayElemAt: ["$categoryData", 0] }, // Lấy object đầu tiên của category
          totalStock: {
            $ifNull: [
              {
                $reduce: {
                  input: "$inventoryData",
                  initialValue: 0,
                  in: { $add: ["$$value", "$$this.stock"] },
                },
              },
              0,
            ],
          },
          statusList: {
            $cond: {
              if: { $gt: [{ $size: "$inventoryData" }, 0] },
              then: {
                $setUnion: [
                  {
                    $map: {
                      input: "$inventoryData",
                      as: "inv",
                      in: "$$inv.status",
                    },
                  },
                ],
              },
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
          "category.name": 1, // Lấy tên danh mục
          "supplierData.name": 1, // Lấy danh sách tên nhà cung cấp
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
