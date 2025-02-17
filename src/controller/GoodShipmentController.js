const GoodsShipmentService = require("../service/GoodShipmentService");
async function createGoodsShipment(req, res) {
  try {
    const goodsShipment = await GoodsShipmentService.createGoodsShipment(
      req.body
    );
    console.log(req.body);
    res
      .status(201)
      .json({ message: "GoodsShipment created", data: goodsShipment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
module.exports = {
  createGoodsShipment,
};
