require("dotenv").config();
const { Client } = require("@elastic/elasticsearch");

const esClient = new Client({ node: "http://18.212.168.133:9200" }); // Thay bằng IP thật

module.exports = { esClient };
