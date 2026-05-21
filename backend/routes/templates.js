import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Lấy tất cả templates
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM templates ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Lỗi lấy templates:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Lấy template theo ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM templates WHERE template_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template không tìm thấy' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Lỗi lấy template:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

export default router;
