const amqp = require("amqplib");

let channel;
let connection;

const amqp = require("amqplib");

async function connectRabbitMQ() {
  if (!connection) {
    connection = await amqp.connect("amqp://18.212.168.133"); // Thay bằng IP public của EC2
    channel = await connection.createChannel();
  }
}

async function sendToQueue(queueName, data) {
  if (!channel) {
    await connectRabbitMQ();
  }

  await channel.assertQueue(queueName);
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));

  console.log(`📩 Đã gửi vào hàng đợi ${queueName}:`, data);
}

module.exports = { sendToQueue };
