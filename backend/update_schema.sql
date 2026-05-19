-- Cập nhật bảng users để thêm password
ALTER TABLE users ADD COLUMN password VARCHAR(255);

-- Nếu bảng users đã có dữ liệu cũ, bạn có thể reset:
-- DELETE FROM cards;
-- DELETE FROM users;

-- Thêm user demo (password: demo123)
INSERT INTO users (name, email, password) VALUES
('Demo User', 'demo@example.com', '$2a$10$YKn1ROYuMmtEjQIi0qU9h.iV1EKxU4f7VJZhp5Oy7PZj8pCJvvxd6')
ON CONFLICT (email) DO NOTHING;
