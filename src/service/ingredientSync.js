const axios = require("axios");
const { esClient } = require("../../config/elasticsearch");

const indexName = "ingredient";

// 🔹 Hàm tạo index nếu chưa tồn tại
const createIndexIfNotExists = async () => {
  const exists = await esClient.indices.exists({ index: indexName });

  if (!exists.body) {
    await esClient.indices.create({
      index: indexName,
      body: {
        mappings: {
          properties: {
            categoryId: { type: "keyword" },
            name: { type: "text" },
            price: { type: "double" },
            unit: { type: "keyword" },
            description: { type: "text" },
            statusList: { type: "keyword" },
            totalStock: { type: "integer" },
          },
        },
      },
    });
    console.log(`✅ Đã tạo index: ${indexName}`);
  } else {
    console.log(`🔹 Index "${indexName}" đã tồn tại.`);
  }
};

// 🔹 Hàm đồng bộ dữ liệu từ API vào Elasticsearch
const fetchAndSyncData = async () => {
  try {
    // Đảm bảo index tồn tại trước khi cập nhật dữ liệu

    // Gọi API để lấy dữ liệu
    const response = await axios.get("http://localhost:2000/inventor");
    console.log("📥 Dữ liệu từ API:", response.data);

    // Xử lý dữ liệu
    const products = response.data?.data || [];

    if (!Array.isArray(products) || products.length === 0) {
      console.log("⚠️ Không có sản phẩm nào để cập nhật.");
      return;
    }

    // Chuẩn bị dữ liệu để bulk insert/update vào Elasticsearch
    const bulkOperations = products.flatMap((product) => [
      { index: { _index: indexName, _id: product._id.toString() } },
      {
        categoryId: product.categoryId?.toString(),
        name: product.name,
        price: product.price,
        unit: product.unit,
        description: product.description,
        statusList:
          Array.isArray(product.statusList) && product.statusList.length > 0
            ? product.statusList[0] // Lấy trạng thái đầu tiên trong mảng
            : "Không có dữ liệu",
        totalStock: product.totalStock,
      },
    ]);

    console.log("📦 Dữ liệu đẩy vào Elasticsearch:", bulkOperations);

    // Gửi dữ liệu lên Elasticsearch
    await esClient.bulk({ body: bulkOperations });

    console.log(`✅ Đã cập nhật ${products.length} sản phẩm vào Elasticsearch`);
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật dữ liệu từ API:", error.message);
  }
};
module.exports = { fetchAndSyncData, createIndexIfNotExists };
