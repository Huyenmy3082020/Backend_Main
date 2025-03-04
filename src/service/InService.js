const Ingredient = require("../models/IngredientsModel");
const Inventory = require("../models/InventoryModel");
const { Client } = require("@elastic/elasticsearch");
const {
  updateIngredientInElasticsearch,
  createIndexIfNotExists,
  deleteIngredientFromElasticsearch,
} = require("./ingredientSync");
const { esClient } = require("../../config/elasticsearch");

const searchIngredients = async (searchQuery) => {
  try {
    const queryBody = {
      index: "ingredient",
      body: {
        query: {
          bool: {
            should: [
              { match: { name: { query: searchQuery, fuzziness: "AUTO" } } },
              {
                match: {
                  description: { query: searchQuery, fuzziness: "AUTO" },
                },
              },
            ],
            minimum_should_match: 1,
          },
        },
      },
    };

    const response = await esClient.search(queryBody);

    if (!response.hits?.hits) {
      console.error("❌ **Lỗi: Elasticsearch không trả về dữ liệu hợp lệ!**");
      throw new Error("Elasticsearch không phản hồi đúng");
    }

    return response.hits.hits.map((hit) => hit._source);
  } catch (error) {
    console.error("❌ Lỗi khi tìm kiếm nguyên liệu:", error);
    throw error;
  }
};

const createIngredient = async (data) => {
  return await Ingredient.create(data);
};

const createIngredientElasticsearch = async (data) => {
  const newIngredient = await Ingredient.create(data);

  await esClient.index({
    index: "ingredient",
    id: newIngredient._id.toString(),
    body: {
      categoryId: newIngredient.categoryId?.toString(),
      name: newIngredient.name,
      price: newIngredient.price,
      unit: newIngredient.unit,
      description: newIngredient.description,
      status: newIngredient.status,
      supplierData: newIngredient.supplierData || [],
      totalStock: newIngredient.totalStock || 0,
      statusList: newIngredient.statusList || [],
      updatedAt: new Date().toISOString(),
    },
  });

  console.log(
    `🚀 Đã thêm nguyên liệu vào Elasticsearch: ${newIngredient.name}`
  );
  return newIngredient;
};

const getAllIngredients = async () => {
  return await Ingredient.find({ isDeleted: false }).populate("categoryId");
};

const getIngredientById = async (id) => {
  return await Ingredient.findById(id).populate("categoryId supplierId");
};

const updateIngredient = async (id, data) => {
  return await Ingredient.findByIdAndUpdate(id, data, { new: true });
};

const deleteIngredient = async (id) => {
  const inventory = await Inventory.find({ ingredientsId: id });
  if (inventory.length > 0) {
    throw new Error("Nguyên liệu này đang được sử dụng trong kho");
  }
  return await Ingredient.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
};

module.exports = {
  createIngredient,
  createIngredientElasticsearch,
  searchIngredients,
  getAllIngredients,
  getIngredientById,
  updateIngredient,
  deleteIngredient,
};
