const Category = require("../models/CategoryModel");

// 🟢 Thêm mới Category
exports.createCategory = async (data) => {
  return await Category.create(data);
};

// 🔵 Lấy danh sách tất cả Category
exports.getAllCategories = async () => {
  return await Category.find();
};

// 🟡 Lấy 1 Category theo ID
exports.getCategoryById = async (id) => {
  return await Category.findById(id);
};

// 🟠 Cập nhật Category
exports.updateCategory = async (id, data) => {
  return await Category.findByIdAndUpdate(id, data, { new: true });
};

// 🔴 Xóa Category
exports.deleteCategory = async (id) => {
  return await Category.findByIdAndDelete(id);
};
exports.getIdCategoryByName = async (name) => {
  const category = await Category.find({ name });
  return category;
};
