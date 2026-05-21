<<<<<<< HEAD
=======
# 🎨 Ứng Dụng Tạo Thiệp Mời
>>>>>>> dev

Một ứng dụng web hiện đại để tạo, chỉnh sửa và quản lý thiệp mời đẹp. Xây dựng bằng React, Node.js, Express, và PostgreSQL.

## 🚀 Tính Năng

- ✅ Xem danh sách các mẫu thiệp
- ✅ Tạo thiệp mới từ mẫu
- ✅ Chỉnh sửa thiệp (tiêu đề, mô tả, màu sắc, font chữ)
- ✅ Xem chi tiết thiệp
- ✅ Xóa thiệp
- ✅ In thiệp
- ✅ Giao diện responsive (mobile, tablet, desktop)

## 📋 Yêu Cầu

- **Node.js** v20+ (hoặc v18+)
- **PostgreSQL** v12+
- **Docker** & **Docker Compose** (tùy chọn)

## 🛠️ Cài Đặt

### Bước 1: Clone hoặc Tải Dự Án

```bash
cd e:\testgis
```

### Bước 2: Cài Đặt PostgreSQL

**Tùy chọn A: Cài đặt cục bộ**

1. Tải và cài đặt PostgreSQL từ https://www.postgresql.org/download/
2. Chạy PostgreSQL Service
3. Tạo database:

```sql
CREATE DATABASE testgis_db;
```

4. Chạy schema.sql để tạo bảng:

```bash
# Sử dụng psql hoặc PgAdmin
psql -U postgres -d testgis_db -f backend/schema.sql
```

**Tùy chọn B: Dùng Docker (Khuyến Nghị)**

Bỏ qua bước này nếu sử dụng Docker Compose ở dưới.

### Bước 3: Cài Đặt Dependencies

**Backend:**

```bash
cd backend
npm install
```

**Frontend (root directory):**

```bash
npm install
```

### Bước 4: Cấu Hình .env

**Backend** (`backend/.env`):

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=testgis_db
DB_USER=postgres
DB_PASSWORD=postgres
PORT=5000
NODE_ENV=development
```

**Frontend** (`.env` ở root):

```env
VITE_API_URL=http://localhost:5000/api
```

## 🏃 Chạy Ứng Dụng

### Cách 1: Chạy Cục Bộ

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

Backend sẽ chạy tại: http://localhost:5000

**Terminal 2 - Frontend:**

```bash
npm run dev
```

Frontend sẽ chạy tại: http://localhost:5173

**Truy cập ứng dụng:** http://localhost:5173

### Cách 2: Chạy với Docker Compose (Khuyến Nghị)

```bash
docker-compose up
```

Điều này sẽ khởi động:
- PostgreSQL tại port 5432
- Backend API tại port 5000
- Frontend tại port 5173

**Truy cập ứng dụng:** http://localhost:5173

Để dừng:

```bash
docker-compose down
```

## 📁 Cấu Trúc Dự Án

```
testgis/
├── backend/                    # Node.js + Express API
│   ├── routes/                # API endpoints
│   │   ├── templates.js       # Template routes
│   │   ├── cards.js           # Card CRUD routes
│   │   └── users.js           # User routes
│   ├── db.js                  # PostgreSQL connection
│   ├── server.js              # Express server
│   ├── schema.sql             # Database schema
│   ├── package.json
│   ├── .env                   # Environment variables
│   └── Dockerfile
├── src/                        # React Frontend
│   ├── pages/                 # Page components
│   │   ├── Home.jsx           # Home page
│   │   ├── CardList.jsx       # List all cards
│   │   ├── CreateCard.jsx     # Create new card
│   │   ├── DetailCard.jsx     # View card details
│   │   └── EditCard.jsx       # Edit card
│   ├── components/
│   │   └── Navbar.jsx         # Navigation bar
│   ├── services/
│   │   └── api.js             # API client
│   ├── styles/                # CSS files
│   │   ├── App.css
│   │   ├── Navbar.css
│   │   ├── Home.css
│   │   ├── CardList.css
│   │   ├── CreateCard.css
│   │   ├── DetailCard.css
│   │   └── EditCard.css
│   ├── App.jsx                # Main app component
│   └── main.jsx               # React entry point
├── package.json               # Frontend dependencies
├── .env                       # Frontend environment
├── docker-compose.yml         # Docker Compose config
├── Dockerfile                 # Frontend Docker image
└── README.md                  # This file
```

## 📊 Database Schema

### templates table
```sql
- template_id (Primary Key)
- name
- category
- description
- image_url
- design_data (JSONB)
- created_at
```

### users table
```sql
- user_id (Primary Key)
- name
- email
- created_at
```

### cards table
```sql
- card_id (Primary Key)
- template_id (Foreign Key)
- user_id (Foreign Key)
- title
- description
- design_data (JSONB)
- created_at
- updated_at
```

## 🔌 API Endpoints

### Templates
- `GET /api/templates` - Lấy tất cả templates
- `GET /api/templates/:id` - Lấy template theo ID

### Cards
- `GET /api/cards` - Lấy tất cả cards
- `GET /api/cards/:id` - Lấy card theo ID
- `POST /api/cards` - Tạo card mới
- `PUT /api/cards/:id` - Cập nhật card
- `DELETE /api/cards/:id` - Xóa card

### Users
- `GET /api/users` - Lấy tất cả users
- `POST /api/users` - Tạo user mới

## 🎯 Ví Dụ Sử Dụng API

### Tạo Card Mới

```bash
curl -X POST http://localhost:5000/api/cards \
  -H "Content-Type: application/json" \
  -d '{
    "template_id": 1,
    "user_id": 1,
    "title": "Lời mời dự tiệc cưới",
    "description": "Kính mời quý khách dự tiệc cưới...",
    "design_data": {
      "backgroundColor": "#fff5f7",
      "textColor": "#ff69b4",
      "fontSize": "16",
      "fontFamily": "Georgia"
    }
  }'
```

## 🐛 Troubleshooting

### Lỗi kết nối database

**Vấn đề:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Giải pháp:**
1. Kiểm tra PostgreSQL đang chạy
2. Kiểm tra `.env` có đúng DB_HOST, DB_PORT, DB_USER, DB_PASSWORD
3. Kiểm tra database `testgis_db` tồn tại
4. Chạy schema.sql nếu chưa:
   ```bash
   psql -U postgres -d testgis_db -f backend/schema.sql
   ```

### Frontend không kết nối được API

**Vấn đề:** Fetch failed từ http://localhost:5000

**Giải pháp:**
1. Kiểm tra backend đang chạy: http://localhost:5000/health
2. Kiểm tra `.env` có `VITE_API_URL=http://localhost:5000/api`
3. Kiểm tra CORS enabled trong backend (đã enable sẵn)

### Docker Compose lỗi

**Vấn đề:** Container không start

**Giải pháp:**
```bash
# Xem logs
docker-compose logs -f

# Xóa containers cũ
docker-compose down -v

# Khởi động lại
docker-compose up --build
```

## 📝 Scripts

### Frontend

```bash
npm run dev      # Chạy dev server
npm run build    # Build production
npm run preview  # Preview build
```

### Backend

```bash
npm run dev      # Chạy với hot reload
npm start        # Chạy production
```

## 🔒 Bảo Mật

- Hiện tại không có authentication
- Để production, hãy thêm JWT authentication
- Sử dụng HTTPS cho production
- Đổi DB_PASSWORD trong `.env`
- Sử dụng environment variables cho secrets

## 📚 Công Nghệ Sử Dụng

- **Frontend:** React 18, Vite, React Router v7
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL 15
- **Containerization:** Docker, Docker Compose
- **Styling:** CSS3

## 🚀 Deployment

### Deployment lên Azure (tùy chọn)

Hãy tạo `azure-deploy.yml` trong `.github/workflows` để tự động deploy khi push code.

### Deployment lên Heroku/Railway (tùy chọn)

```bash
# Build Docker image
docker build -t testgis-backend ./backend
docker build -t testgis-frontend .

# Push lên registry
# ... (tùy cloud provider)
```

## 📞 Hỗ Trợ

Nếu bạn gặp vấn đề:

1. Kiểm tra logs: `console.error()` hoặc `docker-compose logs`
2. Kiểm tra `.env` file
3. Kiểm tra port có bị chiếm: `netstat -ano | findstr :5000` (Windows)
4. Restart Docker/PostgreSQL

## 📄 Giấy Phép

MIT License - Miễn phí sử dụng cho cá nhân và dự án thương mại

---

**Tạo bởi:** Ứng dụng Tạo Thiệp Mời v1.0
**Ngày:** 2024
