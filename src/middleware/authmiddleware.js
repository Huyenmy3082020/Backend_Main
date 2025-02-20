const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authenticateIsAdmin = (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    console.log("token", token);
    if (!token) {
      console.error("❌ Không có access_token trong cookie!");
      return res.status(401).json({ status: "err", mess: "Unauthorized" });
    }

    // ✅ Giải mã token
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
      console.log(JSON.stringify(decoded));
      if (decoded.role === "admin") {
        next();
      }
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Lỗi xác thực token", // Mô tả ngắn về lỗi
        error: error.message, // Thông báo lỗi chi tiết
      });
      return res
        .status(403)
        .json({ status: "err", mess: "Forbidden: " + error.message });
    }
  } catch (error) {
    return res.status(403).json({
      status: "err",
      mess: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};

const authenticateToken = (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    if (!token) {
      console.error("❌ Không có access_token trong cookie!");
      return res.status(401).json({ status: "err", mess: "Unauthorized" });
    }

    // ✅ Giải mã token
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
      req.user = decoded;
      next();
    } catch (error) {
      console.error("❌ Lỗi xác thực token:", error.message);
      return res
        .status(403)
        .json({ status: "err", mess: "Forbidden: " + error.message });
    }
  } catch (error) {
    return res.status(403).json({
      status: "err",
      mess: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};

module.exports = {
  authenticateToken,
  authenticateIsAdmin,
};
