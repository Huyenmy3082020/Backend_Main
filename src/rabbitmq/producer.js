const amqp = require("amqplib");

async function runProducer(data) {
  console.log(data);
  const queueName = "inventoryQueue"; // Hàng đợi chứa thông tin sản phẩm sắp hết
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: true });

    const message = JSON.stringify(data); // Dữ liệu là mảng các sản phẩm hết hàng
    channel.sendToQueue(queueName, Buffer.from(message));
    console.log(`[x] Sent: ${message}`);

    await channel.close();
    await connection.close();
  } catch (err) {
    console.error("Error in producer:", err.message);
  }
}

module.exports = { runProducer };
