require("dotenv").config();
const { Client } = require("@elastic/elasticsearch");

const esClient = new Client({ node: "http://elasticsearch:9200" }); // Đổi thành localhost

module.exports = { esClient };
