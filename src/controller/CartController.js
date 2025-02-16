const CartService = require("../service/CartService");
const createCart = async (req, res) => {
  try {
    const { userId, items, shippingId } = req.body;

    if (!userId || !items || items.length === 0) {
      return res.status(400).json({
        status: "err",
        message: "User ID and items are required",
      });
    }

    const result = await CartService.createCart(userId, items, shippingId);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({
      status: "err",
      message: error.message,
    });
  }
};

const getCartByUser = async (req, res) => {
  try {
    const useID = req.params.id;

    const response = await CartService.getCartByUser(useID);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const alterAmount = async (req, res) => {
  try {
    const { userId, productId, altam } = req.body;
    const existingCart = await CartService.findCartByUser(userId);
    if (!existingCart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại!" });
    }
    const product = existingCart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (!product) {
      return res
        .status(404)
        .json({ message: "Sản phẩm không có trong giỏ hàng!" });
    }

    if (altam === "increase") {
      product.quantity += 1;
    } else if (altam === "decrease") {
      if (product.quantity > 1) {
        product.quantity -= 1;
      } else {
        return res
          .status(400)
          .json({ message: "Số lượng sản phẩm không thể giảm xuống dưới 1!" });
      }
    } else {
      return res.status(400).json({ message: "Yêu cầu không hợp lệ!" });
    }

    // Lưu giỏ hàng đã thay đổi
    await existingCart.save();

    return res.status(200).json({
      message: "Số lượng sản phẩm đã được cập nhật thành công!",
      cart: existingCart,
    });
  } catch (error) {
    console.error("Lỗi trong quá trình cập nhật số lượng:", error);
    return res.status(500).json({ message: "Đã có lỗi xảy ra!" });
  }
};

const deleteAllCard = async (req, res) => {
  try {
    const { cart, productId } = req.body;

    await CartService.deleteAllCard(cart, productId);

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    return res.status(400).json({
      status: "err",
      message: "Lỗi khi xóa tất cả giỏ hàng",
    });
  }
};

const deleteSoft = async (req, res) => {
  try {
    const { cartId, productId } = req.body;

    await CartService.deleteSoft(cartId, productId);

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    return res.status(400).json({
      status: "err",
      message: "Lỗi khi xóa tất cả giỏ hàng",
    });
  }
};

const getAllCart = async (req, res) => {
  try {
    const result = await CartService.getAllCart();

    if (result.status === "err") {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      status: "err",
      message: error.message,
    });
  }
};
const getCartById = async (req, res) => {
  try {
    const { userId, cartId } = req.params; // Lấy userId và cartId từ URL parameters

    if (!userId || !cartId) {
      return res.status(400).json({
        status: "err",
        message: "User ID and Cart ID are required.",
      });
    }

    const result = await CartService.getCartById(userId, cartId); // Gọi service để lấy thông tin giao hàng

    if (!result) {
      return res.status(404).json({
        status: "err",
        message:
          "Shipping information not found for the given cart ID and user ID.",
      });
    }

    return res.status(200).json(result); // Trả về thông tin giao hàng
  } catch (error) {
    return res.status(500).json({
      status: "err",
      message: error.message,
    });
  }
};

const updateShipCart = async (req, res) => {
  try {
    const { id, cartId } = req.body.data;
    const result = await CartService.updateShipCart(id, cartId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("L��i trong quá trình cập nhật đơn hàng:", error);
    return res.status(500).json({ message: "Đã có l��i xảy ra!" });
  }
};

const getAllProductByCart = async (req, res) => {
  try {
    const { id } = req.params;

    const cart = await CartService.getAllProductByCart(id);

    return res.status(200).json({ items: cart.items });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ message: "Error getting products from cart" });
  }
};

const DeleteAllProductByCart = async (req, res) => {
  try {
    const { userId } = req.body; // Lấy userId từ body (hoặc có thể lấy từ params, tuỳ API của bạn)

    // Gọi service để xóa tất cả sản phẩm
    await CartService.deleteAllProductByCart(userId);

    return res.status(200).json({ message: "Xóa tất cả sản phẩm thành công" });
  } catch (error) {
    console.error("Error in DeleteAllProductByCart:", error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi xóa sản phẩm trong giỏ hàng." });
  }
};

const getCartByProductBydetail = async (req, res) => {
  try {
    const { id } = req.params;

    const cart = await CartService.getCartByProductBydetail(id);

    return res.status(200).json({
      cart,
    });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ message: "Error getting products from cart" });
  }
};
module.exports = {
  createCart,
  getCartByUser,
  alterAmount,
  deleteAllCard,
  getAllCart,
  deleteSoft,
  getCartById,
  updateShipCart,
  DeleteAllProductByCart,
  getAllProductByCart,
  getCartByProductBydetail,
};
