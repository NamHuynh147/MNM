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

ALTER TABLE cards ADD COLUMN is_public BOOLEAN DEFAULT FALSE;
ALTER TABLE cards ADD COLUMN published_at TIMESTAMP NULL;
-- Add missing columns to cards table
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS views INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS likes INT DEFAULT 0;

-- Add indexes for better performance
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_cards_is_public ON cards(is_public);
CREATE INDEX idx_cards_created_at ON cards(created_at);

-- Also ensure card_likes table exists
CREATE TABLE IF NOT EXISTS card_likes (
  like_id SERIAL PRIMARY KEY,
  card_id INTEGER REFERENCES cards(card_id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(card_id, user_id)
);


-- Check if likes column exists in cards table
ALTER TABLE cards ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

