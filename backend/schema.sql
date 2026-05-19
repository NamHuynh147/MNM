-- Tạo database (chạy ngoài database)
-- CREATE DATABASE testgis_db;

-- Bảng Templates (Mẫu thiệp)
CREATE TABLE IF NOT EXISTS templates (
  template_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  design_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Users (Người dùng)
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Cards (Thiệp tạo bởi người dùng)
CREATE TABLE IF NOT EXISTS cards (
  card_id SERIAL PRIMARY KEY,
  template_id INTEGER REFERENCES templates(template_id),
  user_id INTEGER REFERENCES users(user_id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  design_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dữ liệu mẫu cho Templates
INSERT INTO templates (name, category, description, design_data) VALUES
('Thiệp Cưới Tây Phương', 'Cưới', 'Mẫu thiệp cưới thanh lịch', '{"colors": ["#fff5f7", "#ff69b4"], "layout": "horizontal"}'),
('Thiệp Sinh Nhật Vui Vẻ', 'Sinh Nhật', 'Mẫu thiệp sinh nhật rực rỡ', '{"colors": ["#ffeb3b", "#ff9800"], "layout": "vertical"}'),
('Thiệp Sự Kiện Chuyên Nghiệp', 'Sự Kiện', 'Mẫu thiệp sự kiện kỹ nghiệp', '{"colors": ["#1a1a1a", "#ffffff"], "layout": "horizontal"}')
ON CONFLICT DO NOTHING;

-- Dữ liệu mẫu cho Users
INSERT INTO users (name, email) VALUES
('Người Dùng Demo', 'demo@example.com')
ON CONFLICT DO NOTHING;
