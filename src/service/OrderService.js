const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");
const Cart = require("../models/CartModel");

const createOrder = async (newProduct) => {
  const { orderItems, payment, shippingPrice, totalPrice, user } = newProduct;

  const errorDetails = [];

  try {
    // Tạo đơn hàng
    const createdOrder = await Order.create({
      orderItems,
      payment,
      shippingPrice,
      totalPrice,
      user,
    });

    const orderIds = createdOrder._id;

    // Cập nhật số lượng tồn kho sản phẩm
    for (const order of orderItems) {
      try {
        const product = await Product.findOneAndUpdate(
          {
            _id: order.productId, // ID của sản phẩm
            countInStock: { $gte: order.quantity }, // Kiểm tra tồn kho
          },
          {
            $inc: {
              countInStock: -order.quantity, // Giảm tồn kho
              selled: +order.quantity, // Tăng số lượng bán
            },
          },
          { new: true }
        );

        if (!product) {
          throw new Error(
            `Sản phẩm với ID ${order.productId} không đủ số lượng tồn kho hoặc không tồn tại.`
          );
        }
      } catch (error) {
        errorDetails.push({
          productId: order.productId,
          message:
            error.message || "Đã xảy ra lỗi trong quá trình cập nhật sản phẩm.",
        });
      }
    }

    // Kiểm tra nếu có lỗi trong quá trình cập nhật sản phẩm
    if (errorDetails.length > 0) {
      return {
        status: "err",
        message:
          "Có lỗi xảy ra trong quá trình cập nhật sản phẩm. Chi tiết: " +
          JSON.stringify(errorDetails),
        details: errorDetails,
      };
    }

    // Cập nhật giỏ hàng, đánh dấu sản phẩm đã mua
    await Cart.updateOne(
      { userId: user },
      {
        $set: {
          "items.$[item].status": "purchased",
        },
      },
      {
        arrayFilters: [
          {
            "item.productId": { $in: orderItems.map((item) => item.productId) },
          },
        ],
      }
    );

    // Trả về thông tin đơn hàng, bao gồm orderId
    return {
      status: "ok",
      data: {
        orderId: orderIds,
        createdOrder,
      },
    };
  } catch (error) {
    console.log("Error creating order:", error);

    return {
      status: "err",
      message: error.message || "Đã xảy ra lỗi không xác định.",
      code: error.status || 500,
      details: errorDetails.length > 0 ? errorDetails : undefined,
    };
  }
};

const deleteOrder = async (orderId) => {
  try {
    // Tìm đơn hàng theo ID và cập nhật các thuộc tính
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        deleted: true, // Thêm trường để đánh dấu xóa mềm, nếu cần
      },
      { new: true } // Trả về bản ghi đã cập nhật
    );

    // Kiểm tra xem đơn hàng có được cập nhật hay không
    if (!updatedOrder) {
      return {
        status: "err",
        message: "Đơn hàng không tồn tại.",
      };
    }

    return {
      status: "ok",
      message: "Sản phẩm đã được hủy thành công",
    };
  } catch (error) {
    return {
      status: "err",
      message: error.message,
    };
  }
};

const getOrder = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const allUser = await Order.find();
      resolve({
        status: "ok",
        data: allUser,
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createOrder,
  getOrder,
  deleteOrder,
};
