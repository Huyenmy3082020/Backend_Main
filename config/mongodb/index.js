const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://hatuan:Hatuan12345%40@cluster0.eocii.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0`
    );
    console.log("✅ Kết nối MongoDB thành công!");
  } catch (err) {
    console.error("❌ Lỗi kết nối MongoDB:", err);
    process.exit(1); // Dừng ứng dụng nếu kết nối thất bại
  }
};

module.exports = connectDB;
