const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const authMiddleware = (req, res, next) => {
  // ✅ Lấy token từ cookie thay vì headers
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({
      mess: "Token xác thực không được cung cấp",
      status: "ERROR",
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) {
      return res.status(403).json({
        mess: "Token xác thực không hợp lệ",
        status: "ERROR",
      });
    }
    if (user?.role === "admin") {
      next();
    } else {
      return res.status(403).json({
        mess: "Quyền truy cập bị từ chối",
        status: "ERROR",
      });
    }
  });
};

const authUserMiddleware = (req, res, next) => {
  const userId = req.params.id;
  const token = req.cookies.access_token; // ✅ Lấy token từ cookie

  if (!token) {
    return res.status(401).json({
      mess: "Token xác thực không được cung cấp",
      status: "ERROR",
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) {
      return res.status(403).json({
        mess: "Token xác thực không hợp lệ",
        status: "ERROR",
      });
    }

    if (user?.id === userId || user?.role === "admin") {
      next();
    } else {
      return res.status(403).json({
        mess: "Quyền truy cập bị từ chối",
        status: "ERROR",
      });
    }
  });
};

const authenticateToken = (req, res, next) => {
  try {
    console.log("🚀 Middleware kiểm tra token...");
    console.log("🔥 Cookies nhận được:", req.cookies);

    const token = req.cookies.access_token;
    if (!token) {
      console.error("❌ Không có access_token trong cookie!");
      return res.status(401).json({ status: "err", mess: "Unauthorized" });
    }

    // ✅ Giải mã token
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
      console.log("✅ Token hợp lệ:", decoded);
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

module.exports = { authMiddleware, authUserMiddleware, authenticateToken };
