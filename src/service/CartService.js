const Cart = require("../models/CartModel");
const User = require("../models/UserModel");

const createCart = async (userId, items) => {
  try {
    // Tìm giỏ hàng của người dùng từ database
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Nếu giỏ hàng chưa tồn tại, tạo mới giỏ hàng và lưu vào database
      cart = new Cart({
        userId,
        items,
      });
      await cart.save();

      return {
        status: "ok",
        message: "Cart created successfully",
        data: {
          cartId: cart._id, // Trả về cartId
          cart, // Thông tin giỏ hàng
        },
      };
    } else {
      // Giỏ hàng đã tồn tại, kiểm tra sản phẩm trong giỏ hàng
      for (let newItem of items) {
        // Tìm sản phẩm đã tồn tại trong giỏ hàng
        const existingItem = cart.items.find(
          (item) => item.productId.toString() === newItem.productId.toString()
        );

        if (existingItem) {
          // Nếu sản phẩm đã có trong giỏ hàng, cập nhật số lượng
          existingItem.quantity += newItem.quantity;

          // Cập nhật lại giỏ hàng trong database
          cart = await Cart.findOneAndUpdate(
            { userId, "items.productId": newItem.productId },
            { $set: { "items.$.quantity": existingItem.quantity } },
            { new: true } // Trả về giỏ hàng sau khi cập nhật
          );

          return {
            status: "ok",
            message: "Cart updated successfully",
            data: {
              cartId: cart._id, // Trả về cartId
              cart, // Thông tin giỏ hàng
            },
          };
        } else {
          // Nếu sản phẩm chưa có trong giỏ hàng, thêm vào giỏ hàng
          cart.items.push(newItem);
        }
      }

      // Lưu giỏ hàng vào database
      await cart.save();

      return {
        status: "ok",
        message: "Cart updated successfully",
        data: {
          cartId: cart._id, // Trả về cartId
          cart, // Thông tin giỏ hàng
          shippingId,
        },
      };
    }
  } catch (error) {
    return {
      status: "err",
      message:
        error.message ||
        "An error occurred while creating or updating the cart.",
    };
  }
};
const findCartByUser = async (userId) => {
  try {
    const cart = await Cart.findOne({ userId });

    return cart;
  } catch (error) {
    console.error("Error finding cart for user:", error.message);
    throw new Error("Unable to find cart for this user");
  }
};

const updateCart = async (cartId, updateData) => {
  try {
    const updatedCart = await Cart.findByIdAndUpdate(
      cartId,
      { $set: updateData },
      { new: true } // Trả về giỏ hàng đã được cập nhật
    );
    return updatedCart;
  } catch (error) {
    throw new Error("Unable to update cart");
  }
};
const getCartByUser = async (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const cartUser = await Cart.findOne({ user: userId });
      resolve({
        status: "ok",
        data: cartUser,
      });
    } catch (error) {
      reject(error);
    }
  });
};
const alterAmount = async (productId, altam) => {
  try {
    // Tìm sản phẩm dựa vào productId trong giỏ hàng

    const existingItem = await Cart.findOne(
      { "items.product": productId },
      { "items.$": 1 }
    );

    if (!existingItem) {
      return {
        status: "fail",
        message: "Product not found in the cart",
      };
    }

    // Tăng hoặc giảm số lượng dựa vào altam
    if (altam === "increase") {
      // Tăng số lượng sản phẩm lên 1
      await Cart.updateOne(
        { "items.product": productId },
        { $inc: { "items.$.amount": 1 } }
      );
    } else if (altam === "decrease") {
      // Giảm số lượng sản phẩm đi 1
      await Cart.updateOne(
        { "items.product": productId },
        { $inc: { "items.$.amount": -1 } }
      );
    }

    // Lấy lại giỏ hàng sau khi cập nhật
    const updatedCart = await Cart.findOne({ "items.product": productId });

    return {
      status: "success",
      data: updatedCart,
    };
  } catch (error) {
    // Xử lý lỗi
    return {
      status: "error",
      message: error.message,
    };
  }
};

const deleteAllCard = async (cart, productId) => {
  try {
    const cart1 = await Cart.findById(cart);

    if (!cart1) {
      throw new Error("Cart not found");
    }

    // Kiểm tra xem cart có items không
    if (cart1.items.length === 0) {
      throw new Error("No items in the cart");
    }

    // Cập nhật giỏ hàng: Xóa sản phẩm khỏi mảng items
    const updatedCart = await Cart.findByIdAndUpdate(
      cart,
      { $pull: { items: { productId: productId } } },
      { new: true }
    );

    // Kiểm tra xem giỏ hàng đã được cập nhật chưa
    if (!updatedCart) {
      throw new Error("Error updating the cart");
    }

    // Kiểm tra nếu sản phẩm không tồn tại trong giỏ
    const productExists = updatedCart.items.some(
      (item) => item.productId.toString() === productId.toString()
    );
    if (!productExists) {
      console.log(
        `Product with id ${productId} has been successfully removed.`
      );
    }

    return updatedCart;
  } catch (error) {
    console.error("Error deleting product from cart:", error);
    throw new Error("Unable to delete product from cart");
  }
};

const deleteSoft = async (productId, cartId) => {
  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      throw new Error("Cart not found");
    }
    const indexProduct = await Cart.items.findIndex(
      (item) => item.productId === productId
    );
    if (indexProduct === 1) {
      cart.items[indexProduct].isDeleted = true;
      cart.items[indexProduct].deletedAt = new Date();
    }
    await cart.save();
  } catch (error) {
    throw new Error("Unable to delete product from cart");
  }
};

const getAllCart = async () => {
  try {
    const carts = await Cart.find()
      .populate({
        path: "items.productId",
      })
      .exec();

    if (!carts || carts.length === 0) {
      return {
        status: "err",
        message: "Không có giỏ hàng nào",
      };
    }

    return {
      status: "success",
      data: carts,
    };
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng:", error);
    throw new Error("Lỗi khi lấy tất cả giỏ hàng!");
  }
};

const getCartById = async (userId, cartId) => {
  try {
    // Tìm kiếm thông tin giao hàng với điều kiện userId và cartId không phải là null
    const ship = await Ship.findOne({
      userId: userId,
      cartId: { $ne: null }, // Loại trừ các bản ghi có cartId bằng null
    });

    if (!ship) {
      return null; // Nếu không tìm thấy thông tin giao hàng, trả về null
    }

    return ship; // Trả về thông tin giao hàng
  } catch (error) {
    console.error("Error in getCartById:", error);
    throw error; // Đảm bảo lỗi được ném ra nếu có sự cố
  }
};

const updateShipCart = async (id, cartId) => {
  try {
    const existingCart = await Cart.find({ where: { shippingId: id } });

    if (existingCart) {
      await Cart.findByIdAndUpdate(
        existingCart._id,
        { shippingId: null },
        { new: true }
      );
    }

    const cart = await Cart.findByIdAndUpdate(
      cartId,
      { shippingId: id },
      { new: true }
    );
    const ship = await Ship.findByIdAndUpdate(id, {
      cartId: cartId,
    });

    await Ship.updateMany(
      {
        cartId: cartId,
        _id: { $ne: id },
      },
      { cartId: null }
    );

    if (!cart) {
      throw new Error("Cart not found");
    }
    return {
      cart,
      ship,
    };
  } catch (error) {
    console.error("Error in updateShipCart:", error);
    throw error;
  }
};

const getAllProductByCart = async (id) => {
  try {
    const cart = await Cart.findOne({ userId: id }).populate("items.productId");
    return cart;
  } catch (error) {
    console.error("Error in getAllProductByCart:", error);
    throw error;
  }
};

const deleteAllProductByCart = async (userId) => {
  try {
    // Xóa tất cả sản phẩm trong giỏ hàng của người dùng
    await Cart.deleteMany({ userId: userId });
    console.log("All products in cart have been deleted.");
  } catch (error) {
    console.error("Error deleting all products in cart:", error);
    throw error;
  }
};
const getCartByProductBydetail = async (id) => {
  try {
    const cart = await Cart.findOne({ cartId: id });
    return cart;
  } catch (error) {
    console.error("Error in getAllProductByCart:", error);
    throw error;
  }
};
module.exports = {
  createCart,
  findCartByUser,
  updateCart,
  getCartByUser,
  alterAmount,
  deleteAllCard,
  deleteAllProductByCart,
  getAllCart,
  deleteSoft,
  updateShipCart,
  getCartById,
  getAllProductByCart,
  getCartByProductBydetail,
};
