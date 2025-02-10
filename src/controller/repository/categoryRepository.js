const Category = require("../../models/CategoryModel");

const findCategoryByName = async (name) => {
  return await Category.findOne({ name }).select("_id"); // Tìm một danh mục duy nhất theo tên
};

module.exports = { findCategoryByName };
