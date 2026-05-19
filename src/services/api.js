const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ===== AUTH =====
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Lỗi đăng ký');
    }
    return await response.json();
  } catch (error) {
    console.error('Lỗi:', error);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Lỗi đăng nhập');
    }
    return await response.json();
  } catch (error) {
    console.error('Lỗi:', error);
    throw error;
  }
};

export const getCurrentUser = async (token) => {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Không thể lấy thông tin user');
    return await response.json();
  } catch (error) {
    console.error('Lỗi:', error);
    throw error;
  }
};

// ===== TEMPLATES =====
export const getTemplates = async () => {
  try {
    const response = await fetch(`${API_URL}/templates`);
    if (!response.ok) throw new Error('Lỗi lấy templates');
    return await response.json();
  } catch (error) {
    console.error('Lỗi:', error);
    throw error;
  }
};

export const getTemplateById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/templates/${id}`);
    if (!response.ok) throw new Error('Lỗi lấy template');
    return await response.json();
  } catch (error) {
    console.error('Lỗi:', error);
    throw error;
  }
};

// ===== CARDS =====
export const getCards = async (filters = {}) => {
  try {
    let url = `${API_URL}/cards`;
    const query = new URLSearchParams();
    
    if (filters.search) query.append('search', filters.search);
    if (filters.category) query.append('category', filters.category);
    
    if (query.toString()) url += `?${query.toString()}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Lỗi lấy danh sách thiệp');
    return await response.json();
  } catch (error) {
    console.error('Lỗi:', error);
    throw error;
  }
};

export const getCardById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/cards/${id}`);
    if (!response.ok) throw new Error('Lỗi lấy thiệp');
    return await response.json();
  } catch (error) {
    console.error('Lỗi:', error);
    throw error;
  }
};

export const createCard = async (cardData, token) => {
  try {
    const response = await fetch(`${API_URL}/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(cardData),
    });
    if (!response.ok) throw new Error('Lỗi tạo thiệp');
    return await response.json();
  } catch (error) {
    console.error('Lỗi:', error);
    throw error;
  }
};

export const updateCard = async (id, cardData, token) => {
  try {
    const response = await fetch(`${API_URL}/cards/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(cardData),
    });
    if (!response.ok) throw new Error('Lỗi cập nhật thiệp');
    return await response.json();
  } catch (error) {
    console.error('Lỗi:', error);
    throw error;
  }
};

export const deleteCard = async (id, token) => {
  try {
    const response = await fetch(`${API_URL}/cards/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    if (!response.ok) throw new Error('Lỗi xóa thiệp');
    return await response.json();
  } catch (error) {
    console.error('Lỗi:', error);
    throw error;
  }
};

// ===== USERS =====
export const getUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error('Lỗi lấy users');
    return await response.json();
  } catch (error) {
    console.error('Lỗi:', error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Lỗi tạo user');
    return await response.json();
  } catch (error) {
    console.error('Lỗi:', error);
    throw error;
  }
};

