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
async function getInventory(ingredientsId) {
  try {
    // 📌 Kiểm tra xem ingredientsId có hợp lệ không (phải là ObjectId của MongoDB)
    if (!mongoose.Types.ObjectId.isValid(ingredientsId)) {
      throw new Error("Invalid ingredientsId"); // Nếu không hợp lệ, ném lỗi
    }

    // 📌 Dùng MongoDB Aggregation Pipeline để truy vấn dữ liệu từ Inventory
    const data = await Inventory.aggregate([
      {
        // 📌 Lọc chỉ lấy dữ liệu có ingredientsId khớp với tham số đầu vào
        $match: { ingredientsId: new mongoose.Types.ObjectId(ingredientsId) },
      },
      {
        // 📌 Nhóm dữ liệu theo ingredientsId
        $group: {
          _id: "$ingredientsId", // Nhóm theo ingredientsId
          totalStock: { $sum: "$stock" }, // Tính tổng số lượng tồn kho
          statusList: { $addToSet: "$status" }, // Lấy danh sách trạng thái (không trùng lặp)
        },
      },
      {
        // 📌 Kết nối với bảng "ingredients" để lấy thông tin nguyên liệu
        $lookup: {
          from: "ingredients", // Tên bảng cần join
          localField: "_id", // Trường trong bảng Inventory (sau khi nhóm)
          foreignField: "_id", // Trường trong bảng ingredients để join
          as: "ingredientInfo", // Kết quả join sẽ lưu vào ingredientInfo (mảng)
        },
      },
      {
        // 📌 Biến ingredientInfo từ mảng thành object đơn lẻ
        $unwind: "$ingredientInfo",
      },
      {
        // 📌 Chỉ lấy các trường cần thiết để trả về
        $project: {
          _id: 1, // Giữ lại _id (chính là ingredientsId)
          ingredientName: "$ingredientInfo.name", // Lấy tên nguyên liệu
          totalStock: 1, // Giữ lại tổng số lượng trong kho
          statusList: 1, // Giữ lại danh sách trạng thái
        },
      },
    ]);

    // 📌 Nếu không tìm thấy dữ liệu, ném lỗi
    if (!data.length) {
      throw new Error("Không tìm thấy sản phẩm trong kho");
    }

    return data[0]; // 📌 Trả về object thay vì array (do aggregate luôn trả về mảng)
  } catch (error) {
    throw new Error(error.message); // 📌 Bắt lỗi và trả về thông báo lỗi
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
  getInventory,
  updateInventory,
  deleteInventory,
};
