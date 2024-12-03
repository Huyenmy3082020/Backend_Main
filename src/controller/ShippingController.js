const Ship = require("../../src/models/ShippingModel");
const ShippingService = require("../service/ShippngService");

const createShip = async (req, res) => {
  try {
    const requiredFields = [
      "fullname",
      "address",
      "city",
      "district",
      "ward",
      "phone",
      "userId",
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "error",
        message: `Missing fields: ${missingFields.join(", ")}`,
      });
    }

    // Tạo object mới từ dữ liệu người dùng
    const newShip = new Ship(req.body);

    // Gọi Service để lưu Shipping
    const result = await ShippingService.createShip(newShip);

    // Phản hồi thành công
    return res.status(201).json({
      status: "success",
      message: "Shipping created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in ShippingController.createShip:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
const getAllShipByUser = async (req, res) => {
  try {
    const id = req.params.id;
    const ships = await ShippingService.getAllShipByUser(id);
    return res.status(200).json({
      status: "success",
      data: ships,
    });
  } catch (e) {
    console.error("Error in ShippingController.getAllShip:", e);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const getShipByCart = async (req, res) => {
  try {
    const cartId = req.body.cartId;
    const ships = await ShippingService.getShipByCart(cartId);
    return res.status(200).json({
      status: "success",
      data: ships,
    });
  } catch (error) {}
};

const getAllShip = async (req, res) => {
  try {
    const ships = await ShippingService.getAllShip();
    return res.status(200).json({
      status: "success",
      data: ships,
    });
  } catch (error) {}
};

module.exports = {
  createShip,
  getAllShipByUser,
  getShipByCart,
  getAllShip,
};
