# Chọn hình ảnh Node.js phiên bản 16 làm base image
FROM node:16

# Mở cổng 3000 cho ứng dụng
EXPOSE 3000

# Đặt thư mục làm việc trong container là /app
WORKDIR /app

# Copy file package.json và package-lock.json để cài đặt các dependency
COPY package.json package-lock.json /app/

# Cài đặt các dependencies của ứng dụng, bao gồm cả nodemon nếu cần
RUN npm install
RUN npm install -g nodemon

# Copy tất cả các file còn lại vào container
COPY . .

# Chạy ứng dụng khi container khởi động bằng nodemon để tự động làm mới
CMD ["nodemon", "src/index.js"]
