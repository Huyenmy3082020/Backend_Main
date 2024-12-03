const Product = require("../models/ProductModel");
const Cart = require("../models/CartModel");
const Category = require("../models/CategoryModel");

const createProduct = async (req) => {
  try {
    const {
      category,
      name,
      image,
      price,
      countInStock,
      rating,
      description,
      discount,
      selled,
    } = req.body;

    if (
      !name ||
      !image ||
      !price ||
      !countInStock ||
      !rating ||
      !description ||
      !discount ||
      !selled
    ) {
      return {
        status: "err",
        message: "Tất cả các trường là bắt buộc",
      };
    }

    const category1 = await Category.findById(category);
    if (!category1) {
      return {
        status: "err",
        message: "Danh mục không hợp lệ.",
      };
    }

    const newProduct = new Product({
      name,
      image,
      price,
      countInStock,
      rating,
      description,
      discount,
      selled,
      category: category1._id,
    });

    await newProduct.save();

    return {
      status: "ok",
      data: newProduct,
    };
  } catch (error) {
    return {
      status: "err",
      message: error.message,
    };
  }
};
const getProduct = async (limit, page, sort, filter) => {
  const totalProduct = await Product.countDocuments();
  return new Promise(async (resolve, reject) => {
    try {
      if (filter) {
        const ObjectFilter = {};
        ObjectFilter[filter[0]] = filter[1];
        const label = filter[0];
        const allProductFilter = await Product.find({
          [label]: { $regex: filter[1] },
        })
          .limit(limit)
          .skip(page * limit);
        const totalProductFilter = Object.keys(allProductFilter).length;
        resolve({
          status: "ok",
          data: allProductFilter,
          totalProduct: totalProductFilter,
          pageCurrent: Number(page + 1),
          totalPage: Math.ceil(totalProduct / limit),
        });
      }
      if (sort) {
        const ObjectSort = {};

        ObjectSort[sort[1]] = sort[0];
        const allProductSort = await Product.find()
          .limit(limit)
          .skip(page * limit)
          .sort(ObjectSort);
        resolve({
          status: "ok",
          data: allProductSort,
          totalProduct: totalProduct,
          pageCurrent: Number(page + 1),
          totalPage: Math.ceil(totalProduct / limit),
        });
      }

      const allProduct = await Product.find()
        .select(
          "name image price countInStock rating discount selled description category"
        )
        .populate("category", "name image")
        .limit(limit)
        .skip(page * limit);
      resolve({
        status: "ok",
        data: allProduct,
        totalProduct: totalProduct,
        pageCurrent: Number(page + 1),
        totalPage: Math.ceil(totalProduct / limit),
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getProductTrash = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const products = await Product.findDeleted();
      resolve({
        status: "ok",
        data: products,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateProduct = async (productId, updateData) => {
  try {
    // Tìm và cập nhật sản phẩm
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return {
        status: "err",
        message: "Sản phẩm không tìm thấy",
      };
    }

    return {
      status: "ok",
      data: updatedProduct,
    };
  } catch (error) {
    return {
      status: "err",
      message: error.message,
    };
  }
};
const deleteProduct = async (productId) => {
  try {
    const checkProductId = await Product.findById(productId);
    if (!checkProductId) {
      return {
        status: "err",
        mess: "Sản phẩm không tìm thấy",
      };
    }

    // Xóa mềm bằng phương thức của mongoose-delete
    await Product.deleteById(productId); // Phương thức này sẽ đánh dấu deletedAt thay vì xóa vĩnh viễn

    return {
      status: "ok",
      mess: "Sản phẩm đã được xóa mềm thành công",
    };
  } catch (error) {
    return {
      status: "err",
      message: error.message,
    };
  }
};
const destroyProduct = async (productId) => {
  try {
    console.log(productId);
    await Product.findByIdAndDelete(productId);
    return {
      status: "ok",
      mess: "Sản phẩm đã được vinh vien thành công",
    };
  } catch (error) {
    return {
      status: "err",
      message: error.message,
    };
  }
};
const deleteMany = async (ids) => {
  try {
    const result = await Product.deleteMany({ _id: { $in: ids } });
    return {
      status: "ok",
      message: `${result.deletedCount} sản phẩm đã được xóa vĩnh viễn`,
    };
  } catch (error) {
    return {
      status: "err",
      message: error.message,
    };
  }
};
const getProductbyId = async (productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const getProductbyId = await Product.findById(productId);
      resolve({
        data: getProductbyId,
      });
    } catch (error) {
      reject(error);
    }
  });
};
const getProductType = async (type) => {
  try {
    const productType = await Product.find({ type });
    return { data: productType };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAllType = async () => {
  try {
    const types = await Product.distinct("type");
    return {
      data: types,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const restoreProduct = async (data) => {
  try {
    await Product.restore(data);

    return {
      status: "ok",
      mess: "Sản phẩm đã được khôi phục thành công",
    };
  } catch (error) {
    return {
      status: "err",
      message: error.message,
    };
  }
};

const search = async (data) => {
  try {
  } catch (error) {}
};

const getAllProductsWithCategory = async (id, filter, sortPrice) => {
  try {
    const query = { category: id };

    if (filter) {
      switch (filter) {
        case "newest": // Mới nhất
          return await Product.find(query)
            .sort({ createdAt: -1 })
            .select(
              "name image price countInStock rating discount selled description category"
            )
            .populate("category", "name image");

        case "bestseller":
          return await Product.find(query)
            .sort({ selled: -1 })
            .select(
              "name image price countInStock rating discount selled description category"
            )
            .populate("category", "name image");

        case "price": // Theo giá
          const sortOrder =
            sortPrice === "priceASC" ? { price: 1 } : { price: -1 };
          return await Product.find(query)
            .sort(sortOrder) // Áp dụng sortOrder cho việc sắp xếp giá
            .select(
              "name image price countInStock rating discount selled description category"
            )
            .populate("category", "name image");

        default:
          return await Product.find(query)
            .select(
              "name image price countInStock rating discount selled description category"
            )
            .populate("category", "name image");
      }
    } else {
      // Nếu không có filter thì trả về tất cả sản phẩm trong danh mục
      return await Product.find(query)
        .select(
          "name image price countInStock rating discount selled description category"
        )
        .populate("category", "name image");
    }
  } catch (error) {
    throw new Error(
      "Error fetching products with categories: " + error.message
    );
  }
};

module.exports = {
  createProduct,
  getAllProductsWithCategory,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductbyId,
  getProductTrash,
  restoreProduct,
  destroyProduct,
  deleteMany,
  getAllType,
  getProductType,
  search,
};
