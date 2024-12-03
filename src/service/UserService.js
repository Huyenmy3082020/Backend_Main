const User = require("../models/UserModel");
const Jwtservice = require("../../src/service/JwtService");
const redisClient = require("../connect/redis");

const bcrypt = require("bcryptjs");

const {
  generralAccesToken,
  generralRefreshToken,
} = require("../../src/service/JwtService");

require("dotenv").config();

const createUser = async (newUser) => {
  const { email, password } = newUser;

  
  try {
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      return {
        status: "err",
        message: "Email đã được đăng ký",
      };
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const createdUser = await User.create({
      email,
      password: hashedPassword,
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

    // Kiểm tra mật khẩu
    const comparePassword = bcrypt.compareSync(password, checkUser.password);
    if (!comparePassword) {
      return {
        status: "ERR",
        message: "Mật khẩu hoặc người dùng không đúng",
      };
    }
    const accessToken = await generralAccesToken({
      id: checkUser.id,
      isAdmin: checkUser.isAdmin,
    });

    const refreshToken = await generralRefreshToken({
      id: checkUser.id,
      isAdmin: checkUser.isAdmin,
    });

    return {
      status: "OK",
      message: "Đăng nhập thành công",
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw error;
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

      await redisClient.del(`user:${id}`);

      await redisClient.set(
        `user:${id}`,
        JSON.stringify(updatedUser),
        "EX",
        3600
      );

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

    // await User.findByIdAndDelete(id);

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
    const cacheData = await redisClient.get(`user:${userId}`);
    if (cacheData) {
      console.log("Lấy dữ liệu từ Redis");
      return { data: JSON.parse(cacheData) };
    }
    const userData = await User.findById(userId);
    if (!userData) {
      return { error: "Người dùng không tồn tại" };
    }

    await redisClient.set(
      `user:${userId}`,
      JSON.stringify(userData),
      "EX",
      3600
    );

    console.log("Lấy dữ liệu từ MongoDB và lưu vào Redis");
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
