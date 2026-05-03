# Fullstack Blog (Phiên Bản Hoàn Thiện / Nâng Cao)

Dự án này là kết quả của bài thực hành Lab 3. Bao gồm đầy đủ tính năng của phần **Cơ Bản** và **Nâng Cao**, với một server **Express (Backend)** và một ứng dụng **NextJS (Frontend)** hoạt động cùng nhau để quản lý bài viết.

## 🚀 Các Chức Năng Đã Hoàn Thành

- **Backend Express (port 5000):**
  - Cấu hình Middleware (`cors`, `express.json()`).
  - Lưu dữ liệu bài viết vào file `data.json` và bình luận vào file `comments.json` sử dụng `fs.promises` (Không mất dữ liệu khi restart server).
  - Đầy đủ các APIs cho bài viết: GET, POST, PUT (chỉnh sửa), DELETE.
  - Đầy đủ các APIs cho bình luận: GET, POST, DELETE.

- **Frontend NextJS (port 3000):**
  - Cấu hình Proxy (rewrite) trong `next.config.ts`.
  - Sử dụng `@tanstack/react-query` và `axios` (`api.ts`) để fetch dữ liệu, quản lý cache tự động, và invalidate queries khi có thay đổi.
  - Giao diện Form thêm bài viết (Tiêu đề, Nội dung, Tác giả).
  - Giao diện danh sách bài viết.
  - Chức năng chỉnh sửa bài viết (Nâng Cao 1).
  - Chức năng xoá bài viết với `useMutation` có rollback khi lỗi.
  - Chức năng thêm và xoá bình luận từng bài viết (Nâng Cao 4).
  - Thông báo thân thiện cho người dùng với `react-hot-toast` (Đăng bài, Xóa bài, Lỗi).

## 📁 Cấu Trúc Thư Mục

```
fullstack-blog/
├── backend/
│   ├── data.json        # File JSON lưu danh sách bài viết
│   ├── comments.json    # File JSON lưu bình luận
│   ├── package.json
│   └── server.js        # File server chính (Express, Routes, JSON I/O)
└── frontend/
    ├── app/
    │   ├── layout.tsx   # Cấu hình Root Layout và Toaster
    │   ├── globals.css
    │   ├── providers.tsx# Cấu hình React Query Provider
    │   └── posts/
    │       └── page.tsx # Giao diện chính (Danh sách, form thêm/sửa/bình luận)
    ├── src/
    │   └── lib/
    │       └── api.ts   # Cấu hình Axios instance
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

Truy cập **http://localhost:3000/posts** trên trình duyệt để trải nghiệm toàn bộ tính năng.
