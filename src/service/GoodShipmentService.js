const mongoose = require("mongoose");
const GoodsShipment = require("../models/GoodShipmentModel");
const Inventory = require("../models/InventoryModel");
const Ingredient = require("../models/IngredientsModel");
const { runProducer } = require("../rabbitmq/producer");

async function createGoodsShipment(data) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let { userId, items, deliveryAddress } = data;
    console.log("Received data:", JSON.stringify(data, null, 2));

    const updatedItems = [];
    const lowStockItems = []; // Mảng để lưu thông tin các sản phẩm tồn kho <= 5

    for (let item of items) {
      if (!item.ingredientsId) {
        throw new Error("ingredientsId is missing in one of the items");
      }

      const inventoryItem = await Inventory.findOne({
        ingredientsId: item.ingredientsId,
      }).session(session);

      if (!inventoryItem) {
        throw new Error(
          `Ingredient with ID ${item.ingredientsId} not found in inventory`
        );
      }

      if (inventoryItem.stock < item.quantity) {
        throw new Error(`Not enough stock for item ${item.ingredientsId}`);
      }

      const ingredient = await Ingredient.findOne({
        _id: item.ingredientsId,
      }).session(session);

      if (!ingredient) {
        throw new Error(`Ingredient with ID ${item.ingredientsId} not found`);
      }

      // Cập nhật tồn kho
      const updatedInventoryItem = await Inventory.findOneAndUpdate(
        { ingredientsId: item.ingredientsId },
        { $inc: { stock: -item.quantity } },
        { session, new: true }
      );

      console.log("updatedInventoryItem", updatedInventoryItem);

      // Nếu tồn kho <= 5, thêm sản phẩm vào mảng lowStockItems
      if (updatedInventoryItem && updatedInventoryItem.stock <= 5) {
        lowStockItems.push({
          ingredientsId: item.ingredientsId,
          ingredientName: ingredient.name,
          remainingStock: updatedInventoryItem.stock,
        });
      }

      updatedItems.push({
        ingredientsId: item.ingredientsId,
        ingredientNameAtPurchase: ingredient.name,
        quantity: item.quantity,
        priceAtShipment: ingredient.price,
      });
    }

    const totalPrice = updatedItems.reduce(
      (sum, item) => sum + item.quantity * item.priceAtShipment,
      0
    );

    const goodsShipment = new GoodsShipment({
      userId,
      items: updatedItems,
      totalPrice,
      deliveryAddress,
    });

    await goodsShipment.save({ session });

    // Log và gửi thông báo về các sản phẩm tồn kho <= 5 nếu có
    if (lowStockItems.length > 0) {
      console.log("Sending low stock notifications for items:", lowStockItems);
      // Gửi thông báo cho tất cả các sản phẩm trong mảng
      await runProducer(lowStockItems);

      // Log lại sau khi gửi thông báo
      console.log("Low stock notification sent:", lowStockItems);
    }

    if (session.inTransaction()) {
      await session.commitTransaction();
    }

    console.log("Transaction committed successfully.");
    return goodsShipment;
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
