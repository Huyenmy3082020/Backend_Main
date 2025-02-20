const User = require("../models/UserModel");
const Jwtservice = require("../../src/service/JwtService");

const bcrypt = require("bcryptjs");

const {
  generralAccesToken,
  generralRefreshToken,
} = require("../../src/service/JwtService");

require("dotenv").config();

const createUser = async (email, password, avatar, phone, name) => {
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const createdUser = await User.create({
      email,
      password: hashedPassword,
      avatar,
      phone,
      name,
    });

    return {
      status: "ok",
      message: "Tạo người dùng thành công",
      data: createdUser,
    };
  } catch (error) {
    throw error;
  }
};

const loginUser = async ({ email, password }) => {
  try {
    const checkUser = await User.findOne({ email });

    if (!checkUser) {
      return {
        status: "ERR",
        message: "Người dùng không tồn tại",
      };
    }

    const isPasswordValid = bcrypt.compareSync(password, checkUser.password);
    if (!isPasswordValid) {
      return {
        status: "ERR",
        message: "Mật khẩu hoặc người dùng không đúng",
      };
    }

    const accessToken = await generralAccesToken({
      id: checkUser.id,
      role: checkUser.role,
    });

    const refreshToken = await generralRefreshToken({
      id: checkUser.id,
      role: checkUser.role,
    });

    return {
      status: "OK",
      message: "Đăng nhập thành công",
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error("❌ Lỗi trong loginUser Service:", error);
    return {
      status: "ERR",
      message: "Lỗi server",
    };
  }
};

const updateUser = async (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findById(id);

      if (!checkUser) {
        return resolve({
          status: "err",
          mess: "User not found",
        });
      }

      const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });

      resolve({
        status: "ok",
        mess: "User updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const deleteUser = async (id) => {
  try {
    const checkUser = await User.findById(id);

    if (!checkUser) {
      return {
        status: "err",
        mess: "User not found",
      };
    }

    await User.findByIdAndDelete(id);

    return {
      status: "ok",
      mess: "User deleted successfully",
    };
  } catch (error) {
    throw error;
  }
};

const getAll = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const allUser = await User.find();
      resolve({
        status: "ok",
        data: allUser,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getAllUserById = async (userId) => {
  try {
    const userData = await User.findById(userId);

    if (!userData) {
      console.error("❌ Không tìm thấy người dùng!");
      return { status: "err", mess: "Người dùng không tồn tại" };
    }

    return { status: "ok", data: userData };
  } catch (error) {
    console.error("❌ Lỗi truy vấn MongoDB:", error);
    return { status: "err", mess: error.message || "An error occurred" };
  }
};
module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAll,
  getAllUserById,
};
