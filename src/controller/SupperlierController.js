const Supplier = require("../models/SupplierModel");

exports.createSupplier = async (req, res) => {
  try {
    const { name, contact, address, status } = req.body;
    const newSupplier = new Supplier({ name, contact, address, status });
    await newSupplier.save();
    res.status(201).json({
      success: true,
      message: "Thêm nhà cung cấp thành công!",
      supplier: newSupplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi thêm nhà cung cấp!",
      error: error.message,
    });
  }
};

exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.status(200).json({ success: true, suppliers });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách nhà cung cấp!",
      error: error.message,
    });
  }
};

// 🟡 Lấy 1 Supplier theo ID
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy nhà cung cấp!" });

    res.status(200).json({ success: true, supplier });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin nhà cung cấp!",
      error: error.message,
    });
  }
};

// 🟠 Cập nhật Supplier
exports.updateSupplier = async (req, res) => {
  try {
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedSupplier)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy nhà cung cấp!" });

    res.status(200).json({
      success: true,
      message: "Cập nhật thành công!",
      supplier: updatedSupplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật nhà cung cấp!",
      error: error.message,
    });
  }
};

// 🔴 Xóa Supplier
exports.deleteSupplier = async (req, res) => {
  try {
    const deletedSupplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!deletedSupplier)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy nhà cung cấp!" });

    res
      .status(200)
      .json({ success: true, message: "Xóa nhà cung cấp thành công!" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa nhà cung cấp!",
      error: error.message,
    });
  }
};
