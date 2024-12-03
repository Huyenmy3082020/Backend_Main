const Category = require("../models/CategoryModel");
const Product = require("../models/ProductModel");
const createCategory = async (categoryData) => {
  const category = new Category(categoryData);
  await category.save();
  return category;
};

const getAllCategories = async () => {
  try {
    return await Category.find().select("name image");
  } catch (error) {
    throw new Error(error.message); // Ném lại lỗi để xử lý ở nơi khác
  }
};

const getCategoryById = async (id) => {
  const category = await Category.findById(id).populate({
    path: "products", // Đường dẫn liên kết
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

const getCategoryByName = async (name) => {
  try {
    const category = await Category.findOne({ name });
    return category;
  } catch (err) {
    console.error("Error fetching category by name:", err);
    throw err;
  }
};
const getCategoryBySlug = async (id) => {
  try {
    const category = await Category.findOne({ id });
    if (!category) {
      throw new Error("Category not found");
    }

    const products = await Product.find({ type: category._id });

    return { category, products };
  } catch (err) {
    console.error("Error fetching category or products:", err);
    throw err;
  }
};

const updateCategory = async (id, categoryData) => {
  return await Category.findByIdAndUpdate(id, categoryData, { new: true });
};

const deleteCategory = async (id) => {
  return await Category.findByIdAndDelete(id);
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  getCategoryByName,
  deleteCategory,
  getCategoryBySlug,
};
