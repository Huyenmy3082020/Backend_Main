const Supplier = require("../../models/SupplierModel");

const findSupplierByName = async (name) => {
  const supplier = await Supplier.findOne({ name }).select("_id");

  if (!supplier) {
    throw new Error(`Không tìm thấy nhà cung cấp: ${name}`);
  }

  return supplier._id; // Chỉ trả về _id thay vì object
};

module.exports = { findSupplierByName };
