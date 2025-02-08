const ingredientService = require("../service/ingredientService");

// 🟢 Thêm mới Ingredient
exports.createIngredient = async (req, res) => {
  try {
    const newIngredient = await ingredientService.createIngredient(req.body);
    res.status(201).json({
      success: true,
      message: "Thêm thành công!",
      ingredient: newIngredient,
    });
  } catch (error) {
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
    const ingredients = await ingredientService.getAllIngredients();
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
    const ingredient = await ingredientService.getIngredientById(req.params.id);
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
    const updatedIngredient = await ingredientService.updateIngredient(
      req.params.id,
      req.body
    );
    if (!updatedIngredient)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy nguyên liệu!" });

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
    const deletedIngredient = await ingredientService.deleteIngredient(
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
