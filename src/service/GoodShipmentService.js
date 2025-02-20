const mongoose = require("mongoose");
const GoodsShipment = require("../models/GoodShipmentModel");
const Inventory = require("../models/InventoryModel");
const Ingredient = require("../models/IngredientsModel");
const { runProducer } = require("../rabbitmq/producer");

const axios = require("axios");

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

        console.log("ingredients", ingredient);
        await axios.post("http://localhost:2001/notification", {
          name: ingredient.name,
          message: `Số lượng còn lại: ${updatedInventoryItem.stock}`,
          stock: updatedInventoryItem.stock,
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

module.exports = {
  createGoodsShipment,
};
