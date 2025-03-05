const Ingredient = require("../models/IngredientsModel");
const Inventory = require("../models/InventoryModel");


const createIngredient = async (data) => {
  return await Ingredient.create(data);
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
  getAllIngredients,
  getIngredientById,
  updateIngredient,
  deleteIngredient,
};
