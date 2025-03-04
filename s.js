const mongoose = require("mongoose");
const Inventory = require("../Backend_NMCNPM/src/models/InventoryModel");
const Ingredient = require("../Backend_NMCNPM/src/models/IngredientsModel");
const { createClient } = require("redis");

const redisClient = createClient({
  socket: {
    host: "redis",
    port: 6379,
  },
});

async function updateInventoryInRedis(ingredientsId, stock) {
  const key = `stock:product_${ingredientsId}`;
  await redisClient.set(key, stock);
  console.log(`✅ Cập nhật Redis: ${key} -> ${stock}`);
}

async function initializeInventory() {
  try {
    await mongoose.connect(
      "mongodb+srv://hatuan:Hatuan12345%40@cluster0.eocii.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0"
    );
    await redisClient.connect();

    console.log("🔄 Đang kiểm tra và thêm dữ liệu Inventory...");

    const ingredients = await Ingredient.find({}); // Lấy danh sách tất cả sản phẩm

    for (const ingredient of ingredients) {
      const existingInventory = await Inventory.findOne({
        ingredientsId: ingredient._id,
      });

      if (!existingInventory) {
        // Nếu chưa có trong Inventory -> Tạo mới với stock = 0 và status = "không có dữ liệu"
        const newInventory = new Inventory({
          ingredientsId: ingredient._id,
          stock: 0,
          status: "không có dữ liệu",
        });

        await newInventory.save();
        console.log(
          `🆕 Thêm mới Inventory cho sản phẩm ${ingredient._id} với stock = 0`
        );

        // 🔥 Đồng bộ lên Redis
        await updateInventoryInRedis(ingredient._id, 0);
      }
    }

    console.log("✅ Hoàn thành khởi tạo dữ liệu Inventory!");
    mongoose.connection.close();
    redisClient.disconnect();
  } catch (error) {
    console.error("❌ Lỗi khi khởi tạo Inventory:", error);
    mongoose.connection.close();
    redisClient.disconnect();
  }
}

// Chạy script
initializeInventory();
