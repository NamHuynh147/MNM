-- Cap nhat bang users de them password va role
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Neu bang users da co du lieu cu, ban co the reset:
-- DELETE FROM cards;
-- DELETE FROM users;

-- User demo thuong
INSERT INTO users (name, email, password, role) VALUES
('Demo User', 'demo@example.com', NULL, 'user')
ON CONFLICT (email) DO NOTHING;

UPDATE users
SET role = 'user'
WHERE email = 'demo@example.com';

-- Tai khoan admin (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@example.com', '$2b$10$tZVPAC0UU7s9qIj/YIqsB.wbfG359F0H2oUpTGUAT4ZlA1FvzFIuK', 'admin')
ON CONFLICT (email) DO NOTHING;

UPDATE users
SET
  name = 'Admin',
  password = '$2b$10$tZVPAC0UU7s9qIj/YIqsB.wbfG359F0H2oUpTGUAT4ZlA1FvzFIuK',
  role = 'admin'
WHERE email = 'admin@example.com';
