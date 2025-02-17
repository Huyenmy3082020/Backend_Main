const GoodsDeliveryService = require("../service/GoodsDeliveryService");
async function getAllGoodsDeliveries(req, res) {
  try {
    const goodsDeliveries = await GoodsDeliveryService.getAllGoodsDeliveries();
    res.status(200).json(goodsDeliveries);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách phiếu nhập hàng", error });
  }
}
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

async function deleteGoodsDelivery(req, res) {
  try {
    const { id } = req.params;
    await GoodsDeliveryService.deleteGoodsDelivery(id);
    res.status(200).json({ message: "GoodsDelivery deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
async function createGoodsShipment(req, res) {
  try {
    const goodsShipment = await GoodsDeliveryService.createGoodsShipment(
      req.body
    );
    res
      .status(201)
      .json({ message: "GoodsShipment created", data: goodsShipment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
module.exports = {
  createGoodsDelivery,
  updateGoodsDelivery,
  deleteGoodsDelivery,
  getAllGoodsDeliveries,
  createGoodsShipment,
};
