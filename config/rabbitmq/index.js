const amqp = require("amqplib");

let channel;
let connection;

async function connectRabbitMQ() {
  if (!connection) {
    connection = await amqp.connect("amqp://rabbitmq"); // Đổi thành localhost
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
