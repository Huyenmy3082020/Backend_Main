const User = require("../models/UserModel");
const Jwtservice = require("../../src/service/JwtService");

const bcrypt = require("bcryptjs");

const {
  generralAccesToken,
  generralRefreshToken,
} = require("../../src/service/JwtService");

require("dotenv").config();

const createUser = async (email, password, avatar, phone) => {
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const createdUser = await User.create({
      email,
      password: hashedPassword,
      avatar,
      phone,
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

const loginUser = async (userLogin) => {
  const { email, password } = userLogin;
  try {
    const checkUser = await User.findOne({ email });

    if (!checkUser) {
      return {
        status: "ERR",
        message: "Người dùng không tồn tại",
      };
    }

    const comparePassword = bcrypt.compareSync(password, checkUser.password);
    if (!comparePassword) {
      return {
        status: "ERR",
        message: "Mật khẩu hoặc người dùng không đúng",
      };
    }

    // Tạo access token và refresh token
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
    throw error; // Đảm bảo có log lỗi trong catch
  }
};

const updateUser = async (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(id, data);
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

const getAllUserbyId = async (userId) => {
  try {
    const userData = await User.findById(userId);
    if (!userData) {
      return { error: "Người dùng không tồn tại" };
    }

    return { data: userData };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAll,
  getAllUserbyId,
};
