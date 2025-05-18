# 📦 Hệ Thống Quản Kho Hàng Trà Sữa

Hệ thống quản lý kho hàng trà sữa đơn giản và hiệu quả, được xây dựng bằng **Node.js**và **Mongodb** theo kiến trúc RESTful API.
Giúp quản lý  quản lý kho hàng trà sữa, đơn nhập, đơn xuất và tồn kho cho doanh nghiệp nhỏ và vừa.

## ✨ Tính Năng

- ✅ Đăng nhập, phân quyền người dùng (JWT)
- 📦 Quản lý CRUD nguyên liệu (Thêm, Xem, Sửa, Xóa)
- 📥 Quản lý đơn nhập hàng
- 📤 Quản lý đơn xuất hàng
- 🔐 Phân quyền theo vai trò (Admin, Nhân viên)
- 📊 API hỗ trợ thống kê báo cáo
- 🐳 Hỗ trợ Docker để triển khai nhanh chóng

## 🔧 Công Nghệ Sử Dụng

- **Backend:** Node.js, Express
- **Cơ sở dữ liệu:** Mongodb
- **Xác thực:** JWT, Bcrypt
- **Triển khai:** Docker, Docker Compose

## 🚀 Cách Chạy Ứng Dụng

```bash
# Clone dự án
git clone https://github.com/Huyenmy3082020/Backend_Main

# Vào thư mục dự án
cd Backend_Main

# Cài đặt các package
npm install


# Các chức năng
## Giao diện chức năng đăng nhập
![image](https://github.com/user-attachments/assets/605ba534-b2e9-42f0-9bd3-75ea447c539c)
## Giao diện xây dựng trang quản lý nguyên liệu
![image](https://github.com/user-attachments/assets/8e3d6122-5297-42db-b7c0-90980bb3f226)
## Xây dựng giao diện quản lý danh sách phiếu nhập hàng
![image](https://github.com/user-attachments/assets/9ac24a1a-2b7d-4f4e-a245-6092915b0ccc)
## Unit Test
-	Unit cho quản lý nguyên liệu
![image](https://github.com/user-attachments/assets/cfcfb355-2207-4e98-9c0c-688c8a0810ab)
-	Unit test cho chức năng tạo đơn xuất hàng
![image](https://github.com/user-attachments/assets/07730f25-4462-4b48-ac75-5baf5f0d4e79)
-	Unit Test cho chức năng tạo đơn nhập hàng
![Uploading image.png…]()


# Chạy ứng dụng ở môi trường phát triển
npm run start:dev
🧪 Chạy Kiểm Thử
bash
Copy
Edit
