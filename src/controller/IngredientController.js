const IngredientService = require("../service/InService");
const { findCategoryByName } = require("./repository/categoryRepository");
const { findSupplierByName } = require("./repository/supplierRepository");

// 🟢 Thêm mới Ingredient
exports.createIngredient = async (req, res) => {
  try {
    const { category, supplier, name, price, description } = req.body;

    // Tìm Category & Supplier từ database
    const categoryObj = await findCategoryByName(category);
    const supplierObj = await findSupplierByName(supplier);

    if (!categoryObj || !supplierObj) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy danh mục hoặc nhà cung cấp!",
      });
    }

    // Lấy _id dưới dạng string
    const categoryId = categoryObj._id.toString();
    const supplierId = supplierObj._id.toString();

    console.log("Category ID:", categoryId, "Supplier ID:", supplierId);

    // Gọi service để tạo nguyên liệu
    const newIngredient = await IngredientService.createIngredient({
      categoryId,
      supplierId,
      name,
      price,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Thêm thành công!",
      ingredient: newIngredient,
    });
  } catch (error) {
    console.error("Lỗi:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi thêm nguyên liệu!",
      error: error.message,
    });
  }
};

// 🔵 Lấy danh sách tất cả Ingredients
exports.getAllIngredients = async (req, res) => {
  try {
    const ingredients = await IngredientService.getAllIngredients();
    res.status(200).json({ success: true, ingredients });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách!",
      error: error.message,
    });
  }
};

// 🟡 Lấy một Ingredient theo ID
exports.getIngredientById = async (req, res) => {
  try {
    const ingredient = await IngredientService.getIngredientById(req.params.id);
    if (!ingredient)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy nguyên liệu!" });

    res.status(200).json({ success: true, ingredient });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu!",
      error: error.message,
    });
  }
};

// 🟠 Cập nhật Ingredient
exports.updateIngredient = async (req, res) => {
  try {
    const existingIngredient = await IngredientService.getIngredientById(
      req.params.id
    );
    if (!existingIngredient)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy nguyên liệu!" });

    const updatedIngredient = await IngredientService.updateIngredient(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật thành công!",
      ingredient: updatedIngredient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật!",
      error: error.message,
    });
  }
};

// 🔴 Xóa Ingredient
exports.deleteIngredient = async (req, res) => {
  try {
    const deletedIngredient = await IngredientService.deleteIngredient(
      req.params.id
    );
    if (!deletedIngredient)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy nguyên liệu!" });

    res.status(200).json({ success: true, message: "Xóa thành công!" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi xóa!", error: error.message });
  }
};
