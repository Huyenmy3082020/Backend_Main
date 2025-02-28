const mongoose = require("mongoose");
const Ingredient = require("../models/IngredientsModel");
const connectDB = require("../../config/mongodb/index");
const { esClient } = require("../../config/elasticsearch");

const indexName = "ingredient";

// 🔹 1. Tạo Index nếu chưa có
const createIndexIfNotExists = async () => {
  const exists = await esClient.indices.exists({ index: indexName });

  if (!exists.body) {
    await esClient.indices.create({
      index: indexName,
      body: {
        mappings: {
          properties: {
            categoryId: { type: "keyword" },
            supplierId: { type: "keyword" },
            name: { type: "text" },
            price: { type: "double" },
            unit: { type: "keyword" },
            description: { type: "text" },
            updatedAt: { type: "date" },
            status: { type: "boolean" },
            isDeleted: { type: "boolean" },
          },
        },
      },
    });
    console.log(`✅ Index '${indexName}' đã được tạo!`);
  }
};

// 🔹 2. Đồng bộ khi thêm sản phẩm
const syncIngredientToElasticsearch = async (ingredient) => {
  await esClient.index({
    index: indexName,
    id: ingredient._id.toString(),
    body: {
      categoryId: ingredient.categoryId?.toString(),
      supplierId: ingredient.supplierId?.toString(),
      name: ingredient.name,
      price: ingredient.price,
      unit: ingredient.unit,
      description: ingredient.description,
      updatedAt: ingredient.updatedAt,
      status: ingredient.status,
      isDeleted: ingredient.isDeleted,
    },
  });

  console.log(`🚀 Đã đồng bộ nguyên liệu: ${ingredient.name}`);
};

// 🔹 3. Cập nhật sản phẩm
const updateIngredientInElasticsearch = async (id, updatedData) => {
  await esClient.update({
    index: indexName,
    id,
    body: { doc: updatedData },
  });

  console.log(`🔄 Đã cập nhật nguyên liệu ${id} trong Elasticsearch`);
};

// 🔹 4. Xóa sản phẩm
const deleteIngredientFromElasticsearch = async (id) => {
  console.log("Id", id);
  await esClient.delete({
    index: indexName,
    id,
  });

  console.log(`🗑️ Đã xóa nguyên liệu ${id} khỏi Elasticsearch`);
};

// 🔹 5. Đồng bộ tất cả dữ liệu từ MongoDB -> Elasticsearch
const syncAllIngredients = async () => {
  try {
    const ingredients = await Ingredient.find({ isDeleted: false });

    if (ingredients.length === 0) {
      console.log("⚠️ Không có nguyên liệu nào để đồng bộ.");
      return;
    }

    const bulkOperations = ingredients.flatMap((ingredient) => [
      { index: { _index: indexName, _id: ingredient._id.toString() } },
      {
        categoryId: ingredient.categoryId?.toString(),
        supplierId: ingredient.supplierId?.toString(),
        name: ingredient.name,
        price: ingredient.price,
        unit: ingredient.unit,
        description: ingredient.description,
        updatedAt: ingredient.updatedAt,
        status: ingredient.status,
        isDeleted: ingredient.isDeleted,
      },
    ]);

    await esClient.bulk({ body: bulkOperations });
    console.log(
      `✅ Đã đồng bộ ${ingredients.length} nguyên liệu vào Elasticsearch`
    );
  } catch (error) {
    console.error("❌ Lỗi khi đồng bộ dữ liệu:", error);
  }
};

// 🛠 Chạy đồng bộ sau khi kết nối MongoDB
const startSync = async () => {
  await connectDB(); // Kết nối MongoDB
  await syncAllIngredients(); // Đồng bộ toàn bộ dữ liệu
};

startSync();

module.exports = {
  createIndexIfNotExists,
  syncIngredientToElasticsearch,
  updateIngredientInElasticsearch,
  deleteIngredientFromElasticsearch,
  syncAllIngredients,
};
