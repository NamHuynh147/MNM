import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Lấy tất cả users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Lỗi lấy users:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Tạo user mới
router.post('/', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Tên và email là bắt buộc' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email đã tồn tại' });
    }
    console.error('Lỗi tạo user:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

export default router;
