const Ingredient = require("../models/IngredientsModel");

exports.createIngredient = async (data) => {
  return await Ingredient.create(data);
};

exports.getAllIngredients = async () => {
  return await Ingredient.find().populate("categoryId supplierId");
};

exports.getIngredientById = async (id) => {
  return await Ingredient.findById(id).populate("categoryId supplierId");
};

exports.updateIngredient = async (id, data) => {
  return await Ingredient.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteIngredient = async (id) => {
  return await Ingredient.findByIdAndDelete(id);
};
