# Football Tournament Management System (MERN Stack)

Hệ thống quản lý giải đấu bóng đá (League và Cup) chuyên nghiệp, hỗ trợ theo dõi lịch thi đấu, bảng xếp hạng, quản lý đội hình, thống kê trận đấu trực tiếp (Live Match Stats) và sơ đồ nhánh đấu Knockout trực quan tự động rẽ nhánh.

---

## Các Tính Năng Nổi Bật

1. **Quản lý giải đấu đa dạng (LEAGUE & CUP):**
   - Hỗ trợ giải đấu tính điểm vòng tròn (League) và giải đấu chia bảng đấu loại trực tiếp (Cup).
   - Tự động tính toán điểm số, hiệu số, thứ hạng trên bảng xếp hạng (Standings) theo thời gian thực từ kết quả các trận đấu.
2. **Sơ đồ nhánh đấu Knockout tự động (Dynamic Connected Bracket):**
   - Tự động vẽ sơ đồ phân nhánh hình cây từ trái sang phải theo số vòng đấu cấu hình (vòng 1/8, Tứ kết, Bán kết, Chung kết).
   - Hiển thị đầy đủ 3 cột tỉ số (Lượt đi, Lượt về, Tổng tỉ số) cho các vòng đấu 2 lượt, và 1 cột tỉ số cho vòng đấu 1 lượt.
   - Nhận diện trạng thái và tự động highlight đường dẫn bằng **màu xanh lá** nổi bật biểu thị đội chiến thắng tiến vào vòng sau.
3. **Quản lý trận đấu & Số liệu trực tiếp (Live Match Control):**
   - Đồng hồ đếm giờ trận đấu trực tiếp (Live Clock).
   - Quản lý danh sách thi đấu (Lineups), thẻ phạt, bàn thắng, cầu thủ kiến tạo.
4. **Hệ thống Dự đoán kết quả (Predictions):**
   - Cho phép người dùng tham gia dự đoán tỷ số trận đấu để tích lũy điểm số.

---

## 🛠️ Công Nghệ Sử Dụng

* **Frontend:** React JS, Vite, TailwindCSS (v4), Ant Design (Antd), Lucide Icons, Axios.
* **Backend:** Node.js (ES Modules), Express JS, Mongoose (MongoDB ODM), Socket.io (Realtime).
* **Database:** MongoDB (Local hoặc MongoDB Atlas Cloud).

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
Project-Web/
├── backend/            # Mã nguồn Server (Node.js/Express)
│   ├── configs/        # Cấu hình kết nối DB
│   ├── controllers/    # Xử lý logic API
│   ├── models/         # Mongoose Schemas (Tournament, Match, Stage...)
│   ├── routes/         # Định tuyến endpoints API
│   ├── server.js       # File chạy chính của server
│   └── .env            # Cấu hình môi trường server
└── frontend/           # Mã nguồn Client (React/Vite)
    ├── src/
    │   ├── api/        # Cấu hình Axios gọi API backend
    │   ├── components/ # Các components UI (Admin, User, Modals...)
    │   ├── pages/      # Các trang chính (Dashboard, Admin, Predictions...)
    │   └── main.jsx    # File chạy chính của React app
```

---

## ⚙️ Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Chuẩn Bị Trước Khi Cài Đặt
* Đã cài đặt **Node.js** (Khuyến nghị phiên bản 18 trở lên).
* Đã cài đặt **Git** trên máy.
* Một cơ sở dữ liệu **MongoDB** đang hoạt động (Local hoặc Atlas Cloud).

### 2. Cài Đặt và Chạy Backend Server
1. Mở Terminal và di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```
2. Cài đặt các thư viện dependencies cần thiết:
   ```bash
   npm install
   ```
3. Tạo file cấu hình môi trường `.env` nằm trong thư mục `backend`:
   *Bạn có thể tạo mới file `.env` và thiết lập các biến sau:*
   ```env
   PORT = 3000
   DB_URL = mongodb://<user>:<password>@<cluster-url>/<db-name>?ssl=true&authSource=admin
   JWT_SECRET = brian2k5pbc
   CLOUDINARY_CLOUD_NAME = o8xqqn0e
   CLOUDINARY_API_KEY = 663982843822484
   CLOUDINARY_API_SECRET = wN2hT6X--AryTEwWiY2Gww-Jq2E
   ```
4. Khởi chạy Server ở chế độ phát triển (Development mode):
   ```bash
   npm run dev
   ```
   *Server sẽ chạy tại địa chỉ: **http://localhost:3000***

### 3. Cài Đặt và Chạy Frontend Client
1. Mở Terminal mới và di chuyển vào thư mục `frontend`:
   ```bash
   cd frontend
   ```
2. Cài đặt các thư viện dependencies cần thiết:
   ```bash
   npm install
   ```
3. Khởi chạy Development Server của Vite:
   ```bash
   npm run dev
   ```
   *Client sẽ khởi chạy tại địa chỉ mặc định của Vite, thông thường là: **http://localhost:5173***

---

## 🧪 Tài Khoản Thử Nghiệm

* **Tài khoản Admin:**
  - Tên đăng nhập: `admin_asean`
  - Mật khẩu: `hashed_password_123_abc`
* **Tài khoản Người Dùng (User):**
  - Tên đăng nhập: `fan_vietnam_01`
  - Mật khẩu: `hashed_password_456_def`

