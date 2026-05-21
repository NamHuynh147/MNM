import express from "express";
import pool from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "Không có token xác thực. Vui lòng đăng nhập." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    return res
      .status(403)
      .json({ error: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

// Middleware for optional authentication
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = { id: decoded.userId };
    } catch (err) {
      // Invalid token, continue as unauthenticated
    }
  }
  next();
};

// Helper function to check if user is admin
const isAdmin = async (userId) => {
  if (!userId) return false;
  try {
    const result = await pool.query(
      "SELECT role FROM users WHERE user_id = $1",
      [userId],
    );
    return result.rows[0]?.role === "admin";
  } catch (err) {
    console.error("Error checking admin:", err);
    return false;
  }
};

// ===== ADMIN ROUTES (Authentication + Admin required) =====

// Test admin access
router.get("/admin-test", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const adminCheck = await isAdmin(userId);

    if (!adminCheck) {
      return res.status(403).json({ error: "Yêu cầu quyền admin" });
    }

    res.json({ message: "Admin access granted", userId, role: "admin" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all cards (admin only) - both public and private
router.get("/all", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const adminCheck = await isAdmin(userId);

    if (!adminCheck) {
      return res.status(403).json({ error: "Yêu cầu quyền admin" });
    }

    const result = await pool.query(
      `SELECT c.*, u.name as author_name, u.email, t.name as template_name
       FROM cards c
       LEFT JOIN users u ON c.user_id = u.user_id
       LEFT JOIN templates t ON c.template_id = t.template_id
       ORDER BY c.created_at DESC`,
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching all cards:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===== PUBLIC ROUTES (No authentication required) =====

// Get all public cards (for exploration/gallery)
router.get("/public", async (req, res) => {
  const { search, sort, limit = 20, offset = 0 } = req.query;

  try {
    let query = `
      SELECT c.*, u.name as author_name, u.email,
             t.name as template_name
      FROM cards c
      LEFT JOIN users u ON c.user_id = u.user_id
      LEFT JOIN templates t ON c.template_id = t.template_id
      WHERE c.is_public = true
    `;

    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    switch (sort) {
      case "popular":
        query += ` ORDER BY c.likes DESC, c.views DESC`;
        break;
      case "most_viewed":
        query += ` ORDER BY c.views DESC`;
        break;
      case "oldest":
        query += ` ORDER BY c.created_at ASC`;
        break;
      default:
        query += ` ORDER BY c.created_at DESC`;
    }

    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    let countQuery = `SELECT COUNT(*) as total FROM cards c WHERE c.is_public = true`;
    const countParams = [];

    if (search) {
      countQuery += ` AND (c.title ILIKE $1 OR c.description ILIKE $1)`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      cards: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (err) {
    console.error("Lỗi lấy public cards:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ===== PROTECTED ROUTES (Authentication required) =====

// Get user's personal cards (their own cards only)
router.get("/my-cards", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdminUser = await isAdmin(userId);

    let query;
    let params;

    if (isAdminUser) {
      // Admin can see all cards
      query = `
        SELECT c.*, t.name as template_name, u.name as author_name
        FROM cards c
        LEFT JOIN templates t ON c.template_id = t.template_id
        LEFT JOIN users u ON c.user_id = u.user_id
        ORDER BY c.updated_at DESC
      `;
      params = [];
    } else {
      // Regular users only see their own cards
      query = `
        SELECT c.*, t.name as template_name
        FROM cards c
        LEFT JOIN templates t ON c.template_id = t.template_id
        WHERE c.user_id = $1
        ORDER BY c.updated_at DESC
      `;
      params = [userId];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi lấy my cards:", err);
    res.status(500).json({ error: "Không thể lấy danh sách thiệp của bạn" });
  }
});

// Create new card
router.post("/", authenticateToken, async (req, res) => {
  const { template_id, title, description, design_data, is_public } = req.body;
  const userId = req.user.id;

  if (!title || !design_data) {
    return res
      .status(400)
      .json({ error: "Tiêu đề và design_data là bắt buộc" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO cards (template_id, user_id, title, description, design_data, is_public, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [
        template_id || null,
        userId,
        title,
        description || "",
        design_data,
        is_public || false,
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Lỗi tạo card:", err);
    res.status(500).json({ error: "Lỗi server khi tạo thiệp" });
  }
});

// Update card (admin can update any card)
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, design_data, is_public } = req.body;
  const userId = req.user.id;

  try {
    const isAdminUser = await isAdmin(userId);

    let checkResult;
    if (isAdminUser) {
      // Admin can update any card
      checkResult = await pool.query("SELECT * FROM cards WHERE card_id = $1", [
        id,
      ]);
    } else {
      // Regular users can only update their own cards
      checkResult = await pool.query(
        "SELECT * FROM cards WHERE card_id = $1 AND user_id = $2",
        [id, userId],
      );
    }

    if (checkResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Card không tìm thấy hoặc bạn không có quyền" });
    }

    const result = await pool.query(
      `UPDATE cards 
       SET title = $1, description = $2, design_data = $3, 
           is_public = $4, updated_at = CURRENT_TIMESTAMP
       WHERE card_id = $5
       RETURNING *`,
      [
        title,
        description,
        design_data,
        is_public !== undefined ? is_public : checkResult.rows[0].is_public,
        id,
      ],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Lỗi cập nhật card:", err);
    res.status(500).json({ error: "Lỗi server khi cập nhật thiệp" });
  }
});

// Toggle card visibility (admin can toggle any card)
router.patch("/:id/visibility", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { is_public } = req.body;
  const userId = req.user.id;

  if (is_public === undefined) {
    return res.status(400).json({ error: "Thiếu trạng thái is_public" });
  }

  try {
    const isAdminUser = await isAdmin(userId);

    let checkResult;
    if (isAdminUser) {
      // Admin can toggle any card
      checkResult = await pool.query("SELECT * FROM cards WHERE card_id = $1", [
        id,
      ]);
    } else {
      // Regular users can only toggle their own cards
      checkResult = await pool.query(
        "SELECT * FROM cards WHERE card_id = $1 AND user_id = $2",
        [id, userId],
      );
    }

    if (checkResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Card không tìm thấy hoặc bạn không có quyền" });
    }

    const result = await pool.query(
      `UPDATE cards 
       SET is_public = $1, 
           published_at = $2, 
           updated_at = CURRENT_TIMESTAMP
       WHERE card_id = $3
       RETURNING *`,
      [is_public, is_public ? new Date() : null, id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Lỗi cập nhật visibility:", err);
    res.status(500).json({ error: "Không thể cập nhật trạng thái công khai" });
  }
});

// Like/Unlike a public card
router.post("/:id/like", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    console.log(`Processing like for card ${id} by user ${userId}`);

    // Check if card exists and is public
    const cardCheck = await pool.query(
      "SELECT card_id, is_public FROM cards WHERE card_id = $1",
      [id],
    );

    if (cardCheck.rows.length === 0) {
      return res.status(404).json({ error: "Card không tồn tại" });
    }

    if (!cardCheck.rows[0].is_public) {
      return res.status(403).json({ error: "Card không công khai" });
    }

    // Check if already liked
    const likeCheck = await pool.query(
      "SELECT * FROM card_likes WHERE card_id = $1 AND user_id = $2",
      [id, userId],
    );

    let newLikeCount;
    let liked;

    if (likeCheck.rows.length > 0) {
      // Unlike
      await pool.query(
        "DELETE FROM card_likes WHERE card_id = $1 AND user_id = $2",
        [id, userId],
      );

      const currentLikes = await pool.query(
        "SELECT likes FROM cards WHERE card_id = $1",
        [id],
      );
      const currentCount = currentLikes.rows[0]?.likes || 0;
      newLikeCount = Math.max(0, currentCount - 1);

      await pool.query("UPDATE cards SET likes = $1 WHERE card_id = $2", [
        newLikeCount,
        id,
      ]);

      liked = false;
      console.log(
        `User ${userId} unliked card ${id}, new count: ${newLikeCount}`,
      );
    } else {
      // Like
      await pool.query(
        "INSERT INTO card_likes (card_id, user_id) VALUES ($1, $2)",
        [id, userId],
      );

      const currentLikes = await pool.query(
        "SELECT likes FROM cards WHERE card_id = $1",
        [id],
      );
      const currentCount = currentLikes.rows[0]?.likes || 0;
      newLikeCount = currentCount + 1;

      await pool.query("UPDATE cards SET likes = $1 WHERE card_id = $2", [
        newLikeCount,
        id,
      ]);

      liked = true;
      console.log(
        `User ${userId} liked card ${id}, new count: ${newLikeCount}`,
      );
    }

    res.json({
      success: true,
      liked: liked,
      likes: newLikeCount,
    });
  } catch (err) {
    console.error("Like error details:", err);
    res.status(500).json({
      error: err.message,
      details: err.toString(),
    });
  }
});

// Check if user has liked a card
router.get("/:id/like-status", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "SELECT * FROM card_likes WHERE card_id = $1 AND user_id = $2",
      [id, userId],
    );

    res.json({
      liked: result.rows.length > 0,
    });
  } catch (err) {
    console.error("Error checking like status:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// Delete card (admin can delete any card)
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const isAdminUser = await isAdmin(userId);

    let checkResult;
    if (isAdminUser) {
      // Admin can delete any card
      checkResult = await pool.query("SELECT * FROM cards WHERE card_id = $1", [
        id,
      ]);
    } else {
      // Regular users can only delete their own cards
      checkResult = await pool.query(
        "SELECT * FROM cards WHERE card_id = $1 AND user_id = $2",
        [id, userId],
      );
    }

    if (checkResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Card không tìm thấy hoặc bạn không có quyền" });
    }

    const result = await pool.query(
      "DELETE FROM cards WHERE card_id = $1 RETURNING *",
      [id],
    );

    res.json({ message: "Xóa thiệp thành công", card: result.rows[0] });
  } catch (err) {
    console.error("Lỗi xóa card:", err);
    res.status(500).json({ error: "Lỗi server khi xóa thiệp" });
  }
});

// ===== PARAMETER ROUTE - MUST BE LAST =====
// Get single card (public or private with authentication)
router.get("/:id", optionalAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT c.*, t.name as template_name, u.name as author_name, u.email
       FROM cards c
       LEFT JOIN templates t ON c.template_id = t.template_id
       LEFT JOIN users u ON c.user_id = u.user_id
       WHERE c.card_id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Card không tìm thấy" });
    }

    const card = result.rows[0];
    const isOwner = req.user && card.user_id === req.user.id;
    const isPublic = card.is_public === true;
    const isAdminUser = req.user ? await isAdmin(req.user.id) : false;

    // Admin can view any card, others only public or their own
    if (!isPublic && !isOwner && !isAdminUser) {
      return res
        .status(403)
        .json({ error: "Bạn không có quyền xem thiệp này" });
    }

    // Increment view count (only for public cards when viewed by non-owner, non-admin)
    if (isPublic && !isOwner && !isAdminUser) {
      await pool.query(
        "UPDATE cards SET views = views + 1 WHERE card_id = $1",
        [id],
      );
      card.views = (card.views || 0) + 1;
    }

    res.json(card);
  } catch (err) {
    console.error("Lỗi lấy card:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

export default router;
