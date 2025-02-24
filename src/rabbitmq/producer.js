const amqp = require("amqplib");

async function runProducer(data) {
  const queueName = "inventoryQueue";
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: true });

    const message = JSON.stringify(data);
    channel.sendToQueue(queueName, Buffer.from(message),{
      expiration:'100000' // time to line // khong xu li se dong 
    },{
      persistent: true // đảm bảo message lưu trữ trong ổ đĩa hoặc cache , nếu lỗi thìlaays từ ổ điiax
    });

    await channel.close();
    await connection.close();
  } catch (err) {
    console.error("Error in producer:", err.message);
  }
}

module.exports = { runProducer };


// durable : true : đảm bảo dữ liệu , khi start hoặc bị lỗi thì queue không mất mesage 
// durable : false :Mất dữ liệu khi restart hoặc server bị lỗi

// có 4 loại exchange 

    // 1. direct : tuyệt đối , message sẽ chuyển đến queue theo routing key
    // 2. topic : tùy chỉnh , message sẽ chuyển đến queue theo pattern routing key
    // 3. fanout : tất cả , message sẽ chuyển đến tất cả các queue
    // 4. headers : tiêu chuẩn , message sẽ chuyển đến queue theo header key