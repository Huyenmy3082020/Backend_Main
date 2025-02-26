const mongoose = require("mongoose");
const GoodsShipment = require("../models/GoodShipmentModel");
const Inventory = require("../models/InventoryModel");
const Ingredient = require("../models/IngredientsModel");
const { runProducer } = require("../rabbitmq/producer");

const axios = require("axios");
const { sendToQueue } = require("../../config/rabbitmq");

async function createGoodsShipment(data) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let { userId, items, deliveryAddress } = data;

    const updatedItems = [];
    const lowStockItems = [];

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

      const updatedInventoryItem = await Inventory.findOneAndUpdate(
        { ingredientsId: item.ingredientsId },
        { $inc: { stock: -item.quantity } },
        { session, new: true }
      );

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

    if (lowStockItems.length > 0) {
      await runProducer(lowStockItems);
    }

    console.log("Success", lowStockItems);

    if (session.inTransaction()) {
      await session.commitTransaction();
    }

    return goodsShipment;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function createGoodsShipmentRedis(data) {
  try {
    let { userId, items, deliveryAddress } = data;

    for (let item of items) {
      if (!item.ingredientsId) {
        throw new Error("ingredientsId is missing in one of the items");
      }

      const inventory = await Inventory.findOne({
        ingredientsId: item.ingredientsId,
      });

      if (!inventory) {
        throw new Error(
          `❌ Nguyên liệu với ID ${item.ingredientsId} không tồn tại trong kho`
        );
      }

      if (item.quantity > inventory.stock) {
        throw new Error(
          `❌ Số lượng đặt (${item.quantity}) lớn hơn số lượng tồn kho (${inventory.stock}) `
        );
      }
    }

    const newShipment = new GoodsShipment(data);
    await newShipment.save();

    console.log("✅ Đơn hàng đã lưu vào database:", newShipment);

    await sendToQueue("shipment_queue", newShipment);
    console.log("✅ Đơn hàng đã gửi vào hàng đợi:", newShipment);

    return {
      message: "Đơn hàng đang được xử lý!",
      shipmentId: newShipment._id,
    };
  } catch (error) {
    console.error("❌ Lỗi khi tạo đơn hàng:", error.message);
    throw error;
  }
}

async function getAllShipment() {
  try {
    const shipment = await GoodsShipment.find();
    return shipment;
  } catch (error) {}
}
module.exports = {
  createGoodsShipment,
  createGoodsShipmentRedis,
  getAllShipment,
};
