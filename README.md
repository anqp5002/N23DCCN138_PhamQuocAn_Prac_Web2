# Fullstack Blog (Phiên Bản Cơ Bản)

Dự án này là kết quả của bài thực hành Lab 3 (Phần cơ bản). Dự án bao gồm một server **Express (Backend)** và một ứng dụng **NextJS (Frontend)** hoạt động cùng nhau để quản lý bài viết.

## 🚀 Các Chức Năng Đã Hoàn Thành (Phần Cơ Bản)

- **Backend Express (port 5000):**
  - Khởi tạo Express Server và cấu hình Middleware (`cors`, `express.json()`).
  - Mảng `posts` lưu trữ dữ liệu trong RAM.
  - Route `GET /api/posts`: Lấy danh sách bài viết.
  - Route `POST /api/posts`: Thêm bài viết mới (có validation).
  - Route `DELETE /api/posts/:id`: Xoá bài viết.

- **Frontend NextJS (port 3000):**
  - Cấu hình Proxy (rewrite) trong `next.config.ts` để gọi API không bị lỗi CORS.
  - Sử dụng `axios` làm công cụ gọi API chính.
  - Giao diện Form thêm bài viết (Tiêu đề, Nội dung, Tác giả).
  - Giao diện danh sách bài viết.
  - Chức năng xoá bài viết với **Optimistic Update** (cập nhật giao diện ngay lập tức trước khi server trả về kết quả).
  - Thông báo thân thiện cho người dùng với `react-hot-toast` (Đăng bài, Xóa bài, Lỗi).

## 📁 Cấu Trúc Thư Mục

```
fullstack-blog-basic/
├── backend/
│   ├── package.json
│   └── server.js        # File server chính (Express, Routes, RAM data)
└── frontend/
    ├── app/
    │   ├── layout.tsx   # Cấu hình Root Layout và Toaster
    │   ├── globals.css
    │   └── posts/
    │       └── page.tsx # Giao diện chính (Form + Danh sách bài viết)
    ├── lib/
    │   └── api.ts       # Cấu hình Axios instance
    ├── next.config.ts   # Cấu hình Proxy
    └── package.json
```

## 🛠 Hướng Dẫn Chạy Dự Án

### 1. Khởi động Backend
Mở một terminal mới, di chuyển vào thư mục `backend` và chạy:
```bash
cd backend
npm install
node server.js
```
*Backend sẽ chạy tại `http://localhost:5000`*

### 2. Khởi động Frontend
Mở một terminal khác, di chuyển vào thư mục `frontend` và chạy:
```bash
cd frontend
npm install
npm run dev
```
*Frontend sẽ chạy tại `http://localhost:3000`*

Truy cập **http://localhost:3000/posts** trên trình duyệt để sử dụng.
