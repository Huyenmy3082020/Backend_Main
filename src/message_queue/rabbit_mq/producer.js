const amqp = require("amqplib");

const message = "hello world";

const runProducer = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    const queueName = "sendMail";

    // Đảm bảo queue tồn tại
    await channel.assertQueue(queueName, { durable: true });

    // Gửi tin nhắn vào queue
    channel.sendToQueue(queueName, Buffer.from(message));

    // Đóng kênh và kết nối
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Error in producer:", error);
  }
};

runProducer().catch(function (error) {
  console.error(error);
  process.exit(1);
});
