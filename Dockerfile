 # Sử dụng image Node.js v18 làm base image
 FROM node:18

 # Sao chép package.json và package-lock.json vào container
 COPY package*.json ./
 
 # Cài đặt các dependencies từ package.json
 RUN npm install
 
 COPY . .
 
 # Mở port 3000 để container có thể giao tiếp với môi trường bên ngoài
 EXPOSE 2000
 
 # Chạy server.js từ thư mục src
 CMD ["node", "src/index.js"]