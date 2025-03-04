const Ingredient = require("../models/IngredientsModel");
const { Client } = require("@elastic/elasticsearch");
const {
  updateIngredientInElasticsearch,
  createIndexIfNotExists,
  deleteIngredientFromElasticsearch,
} = require("./ingredientSync");

const esClient = new Client({ node: "http://elasticsearch:9200" });

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
      supplierId: newIngredient.supplierId?.toString(),
      name: newIngredient.name,
      price: newIngredient.price,
      unit: newIngredient.unit,
      description: newIngredient.description,
      updatedAt: newIngredient.updatedAt,
      status: newIngredient.status,
      isDeleted: newIngredient.isDeleted,
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
  updateIngredientInElasticsearch(id, data);
  return await Ingredient.findByIdAndUpdate(id, data, { new: true });
};

const deleteIngredient = async (id) => {
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
