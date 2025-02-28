const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../src/index"); // Import server chính
const GoodsShipment = require("../../src/models/GoodShipmentModel");
const Inventory = require("../../src/models/InventoryModel");
const Ingredient = require("../../src/models/IngredientsModel");

describe("📦 Kiểm thử API Đơn hàng (Goods Shipment)", () => {
  let ingredientId;
  let userId = new mongoose.Types.ObjectId();

  beforeAll(async () => {
    // Kết nối MongoDB ảo để test
    await mongoose.connect(process.env.TEST_DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Tạo dữ liệu nguyên liệu mẫu
    const ingredient = await Ingredient.create({
      name: "Trà Xanh",
      price: 10000,
      isDeleted: false,
    });

    ingredientId = ingredient._id;

    // Tạo tồn kho cho nguyên liệu
    await Inventory.create({
      ingredientsId: ingredientId,
      stock: 100,
    });
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase(); // Xóa dữ liệu test sau khi hoàn thành
    await mongoose.connection.close();
  });

  test("✅ Tạo đơn hàng thành công", async () => {
    const response = await request(app)
      .post("/api/goods-shipment")
      .send({
        userId,
        deliveryAddress: "123 Đường ABC, TP.HCM",
        items: [
          {
            ingredientsId: ingredientId,
            quantity: 5,
          },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Đơn hàng đang được xử lý!");
  });

  test("❌ Lỗi khi nhập hàng với số lượng vượt quá tồn kho", async () => {
    const response = await request(app)
      .post("/api/goods-shipment")
      .send({
        userId,
        deliveryAddress: "123 Đường ABC, TP.HCM",
        items: [
          {
            ingredientsId: ingredientId,
            quantity: 9999, // Vượt quá tồn kho
          },
        ],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain(
      "Số lượng đặt lớn hơn số lượng tồn kho"
    );
  });

  test("✅ Lấy danh sách đơn hàng", async () => {
    const response = await request(app).get("/api/goods-shipment");
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });
});
