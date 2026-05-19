import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Lấy tất cả cards
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, t.name as template_name FROM cards c 
       LEFT JOIN templates t ON c.template_id = t.template_id 
       ORDER BY c.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Lỗi lấy cards:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Lấy card theo ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT c.*, t.name as template_name FROM cards c 
       LEFT JOIN templates t ON c.template_id = t.template_id 
       WHERE c.card_id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Card không tìm thấy' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Lỗi lấy card:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Tạo card mới
router.post('/', async (req, res) => {
  const { template_id, user_id, title, description, design_data } = req.body;
  
  if (!title || !design_data) {
    return res.status(400).json({ error: 'Tiêu đề và design_data là bắt buộc' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO cards (template_id, user_id, title, description, design_data) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [template_id || null, user_id || 1, title, description || '', design_data]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Lỗi tạo card:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Cập nhật card
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, design_data } = req.body;

  try {
    const result = await pool.query(
      `UPDATE cards 
       SET title = $1, description = $2, design_data = $3, updated_at = CURRENT_TIMESTAMP
       WHERE card_id = $4 
       RETURNING *`,
      [title, description, design_data, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Card không tìm thấy' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Lỗi cập nhật card:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Xóa card
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM cards WHERE card_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Card không tìm thấy' });
    }
    res.json({ message: 'Card đã xóa' });
  } catch (err) {
    console.error('Lỗi xóa card:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

export default router;
