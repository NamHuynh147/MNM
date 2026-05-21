# 🚀 Hướng Dẫn Khởi Động Nhanh

## 5 Phút Setup

### 1️⃣ Yêu Cầu
- Node.js v20+
- PostgreSQL 12+

### 2️⃣ Clone Repository
```bash
cd e:\testgis
```

### 3️⃣ Tạo Database
```sql
CREATE DATABASE testgis_db;
```

Sau đó chạy schema:
```bash
psql -U postgres -d testgis_db -f backend/schema.sql
```

### 4️⃣ Cài Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ..
npm install
```

### 5️⃣ Khởi Động

**Terminal 1:**
```bash
cd backend
npm run dev
```

**Terminal 2:**
```bash
npm run dev
```

Mở http://localhost:5173 ✨

---

## 🐳 Khởi Động với Docker (Nhanh Hơn)

```bash
docker-compose up
```

Truy cập: http://localhost:5173

Để dừng:
```bash
docker-compose down
```

---

## ✅ Kiểm Tra

- Backend: http://localhost:5000/health
- Frontend: http://localhost:5173
- Database: localhost:5432

---

## 🆘 Lỗi?

1. **"connect ECONNREFUSED"** → PostgreSQL không chạy
2. **"Module not found"** → Chạy `npm install` lại
3. **"Port 5000 already in use"** → Đổi PORT trong `.env`

---

## 📖 Tài Liệu Đầy Đủ

Xem [README.md](./README.md) để có hướng dẫn chi tiết.
