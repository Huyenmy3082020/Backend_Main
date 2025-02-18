const amqp = require("amqplib");

const runProducer = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    // exchange chính
    const notificationExchange = "noticationEX";
    // lữu trữ các thông báo từ exchange chính
    const notiQueue = "notificationQueueProcess";
    const notificationExchangeDLX = "noticationDLX";
    const notifiRoutingKey = "notifiRoutingKey";

    // Tạo một kênh
    await channel.assertExchange(notificationExchange, "direct", {
      durable: true,
    });
    // create queue
    const queue = await channel.assertQueue(notiQueue, {
      exclusive: false, // cho phep cac ket noi truy cap cap vao cung 1 luc hang doi
      deadLetterExchange: notificationExchangeDLX,
      deadLetterRoutingKey: notifiRoutingKey,
    });
    //
    await channel.bindQueue(queue.queue, notificationExchange);

    // Gửi message
    const message = "a new product is";
    console.log(message, "a new product is");
    channel.sendToQueue(queue.queue, Buffer.from(message), {
      persistent: true, // lưu message vào queue và disk
      expires: 10000, // message s�� hết hạn sau 10s
    });
    // Đóng kênh và kết nối
    await channel.close();
    await connection.close();
  } catch (err) {
    console.error("Error in producer:", err.message);
  }
};

runProducer();
