const categoryService = require("../service/CategoryService");

// 🟢 Thêm mới Category
exports.createCategory = async (req, res) => {
  try {
    const newCategory = await categoryService.createCategory(req.body);
    res.status(201).json({
      success: true,
      message: "Thêm thành công!",
      category: newCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi thêm danh mục!",
      error: error.message,
    });
  }
};

// 🔵 Lấy danh sách tất cả Categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách!",
      error: error.message,
    });
  }
};

// 🟡 Lấy một Category theo ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy danh mục!" });

    res.status(200).json({ success: true, category });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu!",
      error: error.message,
    });
  }
};

// 🟠 Cập nhật Category
exports.updateCategory = async (req, res) => {
  try {
    const updatedCategory = await categoryService.updateCategory(
      req.params.id,
      req.body
    );
    if (!updatedCategory)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy danh mục!" });

    res.status(200).json({
      success: true,
      message: "Cập nhật thành công!",
      category: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật!",
      error: error.message,
    });
  }
};

// 🔴 Xóa Category
exports.deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await categoryService.deleteCategory(req.params.id);
    if (!deletedCategory)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy danh mục!" });

    res.status(200).json({ success: true, message: "Xóa thành công!" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi xóa!", error: error.message });
  }
};
