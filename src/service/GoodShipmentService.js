const mongoose = require("mongoose");
const GoodsShipment = require("../models/GoodShipmentModel");
const Inventory = require("../models/InventoryModel");
const Ingredient = require("../models/IngredientsModel");

async function createGoodsShipment(data) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let { userId, items, deliveryAddress } = data;

    console.log("Received data:", JSON.stringify(data, null, 2));

    // Lấy thông tin kho hàng trước
    const updatedItems = await Promise.all(
      items.map(async (item) => {
        if (!item.ingredientsId) {
          throw new Error("ingredientsId is missing in one of the items");
        }

        console.log(`Processing ingredient ID: ${item.ingredientsId}`);

        // Lấy thông tin tồn kho
        const inventoryItem = await Inventory.findOne({
          ingredientsId: item.ingredientsId,
        }).session(session);

        console.log("Inventory item:", inventoryItem);

        if (!inventoryItem) {
          throw {
            error: true,
            message: `Nguyên liệu với ID ${item.ingredientsId} không tồn tại trong kho!`,
          };
        }

        if (inventoryItem.stock < item.quantity) {
          throw {
            error: true,
            message: `Không đủ hàng trong kho! (Cần: ${item.quantity}, Tồn: ${inventoryItem.stock})`,
          };
        }

        // Lấy thông tin nguyên liệu
        const ingredient = await Ingredient.findOne({
          _id: item.ingredientsId,
        }).session(session);

        console.log("Ingredient data:", ingredient);

        if (!ingredient) {
          throw new Error(`Ingredient with ID ${item.ingredientsId} not found`);
        }

        // Lấy giá từ Ingredient thay vì Inventory
        if (typeof ingredient.price !== "number" || isNaN(ingredient.price)) {
          throw new Error(
            `Invalid price for ingredient ID ${item.ingredientsId}. Price found: ${ingredient.price}`
          );
        }

        return {
          ingredientsId: item.ingredientsId,
          ingredientNameAtPurchase: ingredient.name,
          quantity: item.quantity,
          priceAtShipment: ingredient.price, // Lấy giá từ bảng Ingredient
        };
      })
    );

    console.log("Updated items after processing:", updatedItems);

    // Tính tổng tiền sau khi có thông tin
    const totalPrice = updatedItems.reduce(
      (sum, item) => sum + item.quantity * item.priceAtShipment,
      0
    );

    console.log("Total price calculated:", totalPrice);

    // Tạo đơn hàng xuất kho
    const goodsShipment = new GoodsShipment({
      userId,
      items: updatedItems,
      totalPrice,
      deliveryAddress,
    });

    console.log("Saving goods shipment:", goodsShipment);

    await goodsShipment.save({ session });

    // Cập nhật tồn kho (giảm số lượng)
    await Promise.all(
      updatedItems.map(async (item) => {
        console.log(`Updating stock for ingredient ID: ${item.ingredientsId}`);

        await Inventory.findOneAndUpdate(
          { ingredientsId: item.ingredientsId },
          { $inc: { stock: -item.quantity } },
          { session, new: true }
        );

        console.log(
          `Stock updated for ingredient ID: ${item.ingredientsId}, reduced by: ${item.quantity}`
        );
      })
    );

    // Kiểm tra session còn tồn tại trước khi commit
    if (session.inTransaction()) {
      await session.commitTransaction();
    }

    console.log("Transaction committed successfully.");

    return goodsShipment; // Trả về kết quả
  } catch (error) {
    await session.abortTransaction();
    console.error("Error in createGoodsShipment:", error);
    throw error;
  } finally {
    session.endSession();
    console.log("Session ended.");
  }
}

module.exports = {
  createGoodsShipment,
};
