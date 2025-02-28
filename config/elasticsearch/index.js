require("dotenv").config();
const { Client } = require("@elastic/elasticsearch");

const esClient = new Client({ node: "http://localhost:9200" }); // Đổi thành localhost

module.exports = { esClient };
