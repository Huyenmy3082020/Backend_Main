const GoodsShipmentService = require("../service/GoodShipmentService");
async function createGoodsShipment(req, res) {
  try {
    const goodsShipment = await GoodsShipmentService.createGoodsShipment(
      req.body
    );
    res
      .status(201)
      .json({ message: "GoodsShipment created", data: goodsShipment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
async function createGoodsShipmentRedis(req, res) {
  try {
    const goodsShipment = await GoodsShipmentService.createGoodsShipmentRedis(
      req.body
    );
    res
      .status(201)
      .json({ message: "GoodsShipment created", data: goodsShipment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
async function getAllShipment(req, res) {
  try {
    const data = await GoodsShipmentService.getAllShipment();
    return res.json({ data: data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = {
  createGoodsShipment,
  createGoodsShipmentRedis,
  getAllShipment,
};
