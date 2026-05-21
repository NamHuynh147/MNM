import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CardDesigner from "../components/CardDesigner";
import * as api from "../services/api";
import "../styles/EditCard.css";

function EditCard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [designData, setDesignData] = useState({
    backgroundColor: "#fff7ed",
    elements: [],
  });

  useEffect(() => {
    // Check authentication
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      navigate("/login");
      return;
    }

    setToken(storedToken);
    fetchCard(storedToken);
  }, [id, navigate]);

  const fetchCard = async (authToken) => {
    try {
      setLoading(true);
      // Pass token to getCardById
      const data = await api.getCardById(id, authToken);
      setCard(data);
      setFormData({
        title: data.title,
        description: data.description || "",
      });
      setDesignData(
        data.design_data || { backgroundColor: "#fff7ed", elements: [] },
      );
      setError(null);
    } catch (err) {
      console.error("Error fetching card:", err);
      setError(err.message || "Không thể lấy thông tin thiệp");

      // If unauthorized, redirect to login
      if (
        err.message.includes("Token") ||
        err.message.includes("hết hạn") ||
        err.status === 401
      ) {
        setTimeout(() => navigate("/login"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title) {
      setError("Vui lòng điền tiêu đề");
      return;
    }

    if (!token) {
      setError("Vui lòng đăng nhập lại");
      navigate("/login");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Prepare card data
      const cardData = {
        title: formData.title,
        description: formData.description,
        design_data: designData,
        is_public: card?.is_public || false,
      };

      console.log("Updating card with data:", cardData); // Debug log

      // Pass token to updateCard
      await api.updateCard(id, cardData, token);

      alert("Cập nhật thiệp thành công!");
      navigate(`/cards/${id}`);
    } catch (err) {
      console.error("Error updating card:", err);
      setError(err.message || "Lỗi cập nhật thiệp. Vui lòng thử lại.");

      // If token error, redirect to login
      if (err.message.includes("Token") || err.message.includes("hết hạn")) {
        setTimeout(() => navigate("/login"), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading && !card) {
    return (
      <div className="container">
        <div className="loading-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-content"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="designer-page-header">
        <div>
          <h1>Chỉnh sửa thiệp</h1>
          <p>
            Chọn một chi tiết trên thiệp để kéo, đổi chữ, đổi màu hoặc chỉnh
            lớp.
          </p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p className="error">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="edit-card-form designer-form">
        <div className="designer-meta">
          <div className="form-group">
            <label htmlFor="title">Tiêu đề thiệp *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>
        </div>

        <CardDesigner
          value={designData}
          title={formData.title}
          description={formData.description}
          onChange={setDesignData}
          readOnly={false}
        />

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(`/cards/${id}`)}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditCard;
