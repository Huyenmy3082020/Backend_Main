const Supplier = require("../../models/SupplierModel");

const findSupplierByName = async (name) => {
  return await Supplier.findOne({ name }).select("_id"); // Lấy _id thay vì id
};

module.exports = { findSupplierByName };
