const mongoose = require("mongoose");
const connectDB = require("./config/mongodb/index"); // Import hàm kết nối
const Ingredient = require("./src/models/IngredientsModel"); // Import model nguyên liệu

// Kết nối đến MongoDB
connectDB();

// Danh sách nguyên liệu với categoryId chính xác
const ingredients = [
  {
    categoryId: "67bb4002d4bdccaa12d6fb05",
    name: "Trà đen",
    price: 50000,
    unit: "g",
    description: "Trà đen thơm ngon, thích hợp pha trà sữa",
  },
  {
    categoryId: "67bb4002d4bdccaa12d6fb05",
    name: "Trà xanh",
    price: 55000,
    unit: "g",
    description: "Trà xanh nguyên chất, thanh mát",
  },
  {
    categoryId: "67bb4002d4bdccaa12d6fb05",
    name: "Trà ô long",
    price: 60000,
    unit: "g",
    description: "Trà ô long có hương vị đặc trưng",
  },

  {
    categoryId: "67bb4002d4bdccaa12d6fb06",
    name: "Sữa bột",
    price: 70000,
    unit: "hộp",
    description: "Sữa bột giúp tăng độ béo cho trà sữa",
  },
  {
    categoryId: "67bb4002d4bdccaa12d6fb06",
    name: "Sữa đặc",
    price: 20000,
    unit: "chai",
    description: "Sữa đặc có đường giúp tăng độ ngọt",
  },

  {
    categoryId: "67bb4002d4bdccaa12d6fb07",
    name: "Đường nâu",
    price: 15000,
    unit: "kg",
    description: "Đường nâu giúp tăng vị ngọt tự nhiên",
  },
  {
    categoryId: "67bb4002d4bdccaa12d6fb07",
    name: "Mật ong",
    price: 65000,
    unit: "chai",
    description: "Mật ong giúp trà sữa có vị ngọt dịu",
  },

  {
    categoryId: "67bb4002d4bdccaa12d6fb08",
    name: "Trân châu đen",
    price: 30000,
    unit: "gói",
    description: "Trân châu dai giòn, phù hợp với mọi loại trà sữa",
  },
  {
    categoryId: "67bb4002d4bdccaa12d6fb08",
    name: "Trân châu trắng",
    price: 32000,
    unit: "gói",
    description: "Trân châu trắng dẻo dai, có vị ngọt nhẹ",
  },
  {
    categoryId: "67bb4002d4bdccaa12d6fb08",
    name: "Thạch rau câu",
    price: 25000,
    unit: "gói",
    description: "Thạch rau câu mềm, nhiều màu sắc",
  },
  {
    categoryId: "67bb4002d4bdccaa12d6fb08",
    name: "Kem cheese",
    price: 70000,
    unit: "hộp",
    description: "Kem cheese béo ngậy, giúp trà sữa ngon hơn",
  },

  {
    categoryId: "67bb4002d4bdccaa12d6fb09",
    name: "Hương vani",
    price: 45000,
    unit: "chai",
    description: "Hương vani giúp trà sữa có mùi thơm đặc trưng",
  },
  {
    categoryId: "67bb4002d4bdccaa12d6fb09",
    name: "Hương bạc hà",
    price: 48000,
    unit: "chai",
    description: "Hương bạc hà thơm mát, giúp trà sữa ngon hơn",
  },
  {
    categoryId: "67bb4002d4bdccaa12d6fb09",
    name: "Hương dâu",
    price: 47000,
    unit: "chai",
    description: "Hương dâu ngọt dịu, tạo màu sắc đẹp",
  },

  {
    categoryId: "67bb4002d4bdccaa12d6fb0a",
    name: "Siro dâu",
    price: 45000,
    unit: "chai",
    description: "Siro dâu giúp tăng hương vị",
  },
  {
    categoryId: "67bb4002d4bdccaa12d6fb0a",
    name: "Siro việt quất",
    price: 47000,
    unit: "chai",
    description: "Siro việt quất có hương vị chua ngọt hấp dẫn",
  },
  {
    categoryId: "67bb4002d4bdccaa12d6fb0a",
    name: "Siro đào",
    price: 46000,
    unit: "chai",
    description: "Siro đào giúp trà sữa có hương vị đào thơm ngon",
  },

  {
    categoryId: "67bb4002d4bdccaa12d6fb0b",
    name: "Bột cacao",
    price: 55000,
    unit: "hộp",
    description: "Bột cacao giúp làm trà sữa socola",
  },
  {
    categoryId: "67bb4002d4bdccaa12d6fb0b",
    name: "Bột matcha",
    price: 60000,
    unit: "hộp",
    description: "Bột matcha giúp pha trà sữa matcha thơm ngon",
  },
];

// Hàm thêm dữ liệu vào MongoDB
const seedDatabase = async () => {
  try {
    await Ingredient.insertMany(ingredients);
    console.log("✅ Thêm dữ liệu nguyên liệu trà sữa thành công!");
    mongoose.connection.close(); // Đóng kết nối sau khi thêm xong
  } catch (error) {
    console.error("❌ Lỗi khi thêm dữ liệu:", error);
    mongoose.connection.close();
  }
};

// Chạy hàm seed database
seedDatabase();
