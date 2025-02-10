const GoodsDeliveryService = require("../service/GoodsDeliveryService");

// Thêm phiếu nhập hàng
async function createGoodsDelivery(req, res) {
  try {
    const goodsDelivery = await GoodsDeliveryService.createGoodsDelivery(
      req.body
    );
    res
      .status(201)
      .json({ message: "GoodsDelivery created", data: goodsDelivery });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Sửa phiếu nhập hàng
async function updateGoodsDelivery(req, res) {
  try {
    const { id } = req.params;
    const goodsDelivery = await GoodsDeliveryService.updateGoodsDelivery(
      id,
      req.body
    );
    res
      .status(200)
      .json({ message: "GoodsDelivery updated", data: goodsDelivery });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Xóa phiếu nhập hàng
async function deleteGoodsDelivery(req, res) {
  try {
    const { id } = req.params;
    await GoodsDeliveryService.deleteGoodsDelivery(id);
    res.status(200).json({ message: "GoodsDelivery deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = {
  createGoodsDelivery,
  updateGoodsDelivery,
  deleteGoodsDelivery,
};
