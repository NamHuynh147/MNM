const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ===== AUTH =====
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Lỗi đăng ký");
    }
    const data = await response.json();

    // Store token and user data
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error("Lỗi:", error);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Lỗi đăng nhập");
    }
    const data = await response.json();

    // Store token and user data
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error("Lỗi:", error);
    throw error;
  }
};

export const getCurrentUser = async (token) => {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Không thể lấy thông tin user");
    const userData = await response.json();

    // Store user with consistent field names
    const user = {
      id: userData.user_id,
      user_id: userData.user_id,
      name: userData.name,
      email: userData.email,
      role: userData.role || "user",
      full_name: userData.name,
    };

    localStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch (error) {
    console.error("Lỗi:", error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// ===== TEMPLATES =====
export const getTemplates = async () => {
  try {
    const response = await fetch(`${API_URL}/templates`);
    if (!response.ok) throw new Error("Lỗi lấy templates");
    return await response.json();
  } catch (error) {
    console.error("Lỗi:", error);
    throw error;
  }
};

export const getTemplateById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/templates/${id}`);
    if (!response.ok) throw new Error("Lỗi lấy template");
    return await response.json();
  } catch (error) {
    console.error("Lỗi:", error);
    throw error;
  }
};

// ===== CARDS =====

// Get user's personal cards (requires authentication)
export const getMyCards = async (token) => {
  try {
    const response = await fetch(`${API_URL}/cards/my-cards`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Lỗi lấy danh sách thiệp của bạn");
    }
    const data = await response.json();
    // Ensure we return an array
    return Array.isArray(data) ? data : data.cards || [];
  } catch (error) {
    console.error("Lỗi:", error);
    throw error;
  }
};

// Get public cards (no authentication required)
export const getPublicCards = async (filters = {}) => {
  try {
    let url = `${API_URL}/cards/public`;
    const query = new URLSearchParams();

    if (filters.search) query.append("search", filters.search);
    if (filters.sort) query.append("sort", filters.sort);
    if (filters.limit) query.append("limit", filters.limit);
    if (filters.offset) query.append("offset", filters.offset);

    if (query.toString()) url += `?${query.toString()}`;

    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Lỗi lấy danh sách thiệp công khai");
    }
    const data = await response.json();
    // Handle both array and object responses
    return Array.isArray(data) ? data : data.cards || [];
  } catch (error) {
    console.error("Lỗi:", error);
    throw error;
  }
};

// Get single card by ID (works for both public and private with optional auth)
export const getCardById = async (id, token = null) => {
  try {
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/cards/${id}`, { headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Lỗi lấy thiệp");
    }
    return await response.json();
  } catch (error) {
    console.error("Lỗi:", error);
    throw error;
  }
};

// Create new card
export const createCard = async (cardData, token) => {
  try {
    const response = await fetch(`${API_URL}/cards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cardData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Lỗi tạo thiệp");
    }
    return await response.json();
  } catch (error) {
    console.error("Lỗi:", error);
    throw error;
  }
};

// Update card
export const updateCard = async (id, cardData, token) => {
  try {
    const response = await fetch(`${API_URL}/cards/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cardData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Lỗi cập nhật thiệp");
    }
    return await response.json();
  } catch (error) {
    console.error("Lỗi:", error);
    throw error;
  }
};

// Delete card
export const deleteCard = async (id, token) => {
  try {
    const response = await fetch(`${API_URL}/cards/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Lỗi xóa thiệp");
    }
    return await response.json();
  } catch (error) {
    console.error("Lỗi:", error);
    throw error;
  }
};

// Toggle card visibility (public/private)
export const toggleCardVisibility = async (id, isPublic, token) => {
  try {
    const response = await fetch(`${API_URL}/cards/${id}/visibility`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ is_public: isPublic }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Lỗi cập nhật trạng thái công khai");
    }
    return await response.json();
  } catch (error) {
    console.error("Lỗi:", error);
    throw error;
  }
};
// Like/Unlike a card
export const likeCard = async (id, token) => {
  try {
    const response = await fetch(`${API_URL}/cards/${id}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Lỗi thao tác thích");
    }

    return await response.json();
  } catch (error) {
    console.error("Lỗi trong likeCard:", error);
    throw error;
  }
};
// Get like status for multiple cards
// Check if user has liked a card
export const getLikeStatus = async (id, token) => {
  try {
    const response = await fetch(`${API_URL}/cards/${id}/like-status`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Lỗi kiểm tra trạng thái thích");
    }

    return await response.json();
  } catch (error) {
    console.error("Lỗi trong getLikeStatus:", error);
    return { liked: false }; // Return default on error
  }
};
// In api.js - update getAllCards function
export const getAllCards = async (filters = {}, token) => {
  try {
    const response = await fetch(`${API_URL}/cards/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Lỗi lấy danh sách thiệp");
    }

    return await response.json();
  } catch (error) {
    console.error("Lỗi:", error);
    throw error;
  }
};
// ===== USERS =====
export const getUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error("Lỗi lấy users");
    return await response.json();
  } catch (error) {
    console.error("Lỗi:", error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error("Lỗi tạo user");
    return await response.json();
  } catch (error) {
    console.error("Lỗi:", error);
    throw error;
  }
};
