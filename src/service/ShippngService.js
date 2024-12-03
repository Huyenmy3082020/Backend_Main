const Ship = require("../models/ShippingModel");
const User = require("../models/UserModel");
const Cart = require("../models/CartModel");

const createShip = async (newShip) => {
  try {
    const savedShip = await Ship.create(newShip); // Lưu vào MongoDB

    if (newShip.cartId) {
      const updatedCart = await Cart.findByIdAndUpdate(
        newShip.cartId.toString(),
        { shippingId: savedShip._id },
        { new: true }
      );

      return {
        updatedCart,
        savedShip,
      };
    } else {
      return {
        savedShip,
      };
    }
  } catch (error) {
    console.error("Error in ShippingService.createShip:", error);
    throw error; // Ném lỗi để Controller xử lý
  }
};
const getAllShipByUser = async (id) => {
  try {
    console.log(id);

    const user = await User.findById(id);
    if (user) {
      const ships = await Ship.find({ userId: id });
      return ships;
    }
  } catch (error) {
    console.error("Error in ShippingService.getAllShip:", error);
    throw error;
  }
};

const getShipByCart = async (cartId) => {
  try {
    const ships = await Ship.findOne({ cartId: cartId });
    return ships;
  } catch (error) {
    console.error("Error in ShippingService.getShipByCart:", error);
    throw error;
  }
};

const getAllShip = async (cartId) => {
  try {
    const ships = await Ship.find();

    return ships;
  } catch (error) {
    console.error("Error in ShippingService.getShipByCart:", error);
    throw error;
  }
};

module.exports = {
  createShip,
  getAllShipByUser,
  getShipByCart,
  getAllShip,
};
