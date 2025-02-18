const amqp = require("amqplib");

const runConsumer = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    const queueName = "sendMail";

    // Đảm bảo queue tồn tại
    await channel.assertQueue(queueName, { durable: true });

    // Lắng nghe tin nhắn từ queue
    channel.consume(
      queueName,
      (message) => {
        if (message !== null) {
          console.log(" [x] Received '%s'", message.content.toString());
          channel.ack(message); // Xác nhận đã nhận tin nhắn
        }
      },
      { noAck: false } // Đảm bảo không tự động xác nhận tin nhắn nếu không được xử lý
    );
    console.log(
      `[*] Waiting for messages in ${queueName}. To exit press CTRL+C`
    );
  } catch (error) {
    console.error("Error in consumer:", error);
    process.exit(1);
  }
};

runConsumer().catch(function (error) {
  console.error(error);
  process.exit(1);
});
