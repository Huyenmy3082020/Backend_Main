require("dotenv").config();
const { Client } = require("@elastic/elasticsearch");

const esClient = new Client({ node: "http://72.31.94.59:9200" }); // Thay bằng IP thật

module.exports = { esClient };
