import { Client } from "@elastic/elasticsearch";

const esClient = new Client({ node: "http://elasticsearch:9200" });

const createIndexIfNotExists = async () => {
  const index = "ingredient";

  const exists = await esClient.indices.exists({ index });

  if (!exists.body) {
    await esClient.indices.create({
      index,
      body: {
        mappings: {
          properties: {
            categoryId: { type: "keyword" },
            supplierId: { type: "keyword" },
            name: { type: "text" },
            price: { type: "double" },
            unit: { type: "keyword" },
            description: { type: "text" },
            updatedAt: { type: "date" },
            status: { type: "boolean" },
            isDeleted: { type: "boolean" },
          },
        },
      },
    });
    console.log(`✅ Đã tạo index: ${index}`);
  } else {
    console.log(`🔹 Index "${index}" đã tồn tại.`);
  }
};
module.exports = { createIndexIfNotExists };
