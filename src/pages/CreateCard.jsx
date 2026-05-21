import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CardDesigner from "../components/CardDesigner";
import * as api from "../services/api";
import { Info } from "lucide-react";
import "../styles/CreateCard.css";

function CreateCard() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    template_id: "",
    title: "",
    description: "",
  });
  const [designData, setDesignData] = useState({
    backgroundColor: "#fff7ed",
    elements: [],
  });

  const isLoggedIn = !!localStorage.getItem("token");
  const [isTrialMode, setIsTrialMode] = useState(!isLoggedIn);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    }

    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const data = await api.getTemplates();
      setTemplates(data);
      setError(null);
    } catch (err) {
      setError("Không thể lấy danh sách mẫu");
      console.error(err);
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

    // Nếu là chế độ dùng thử
    if (isTrialMode) {
      alert("Bạn đang ở chế độ dùng thử. Vui lòng đăng nhập để lưu thiệp!");
      navigate("/login");
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

      const cardData = {
        title: formData.title,
        description: formData.description,
        template_id: formData.template_id
          ? parseInt(formData.template_id)
          : null,
        design_data: designData,
        is_public: false,
      };

      const result = await api.createCard(cardData, token);

      alert("Tạo thiệp thành công!");
      navigate(`/cards/${result.card_id}`);
    } catch (err) {
      console.error("Error creating card:", err);
      setError(err.message || "Lỗi tạo thiệp. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    // Cho phép xem trước mà không cần lưu
    window.open("/preview", "_blank");
  };

  if (loading) {
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
          <h1>Tạo thiệp mới</h1>
          <p>Kéo chữ, ảnh, sticker và khối màu để tự thiết kế bố cục thiệp.</p>
        </div>
      </div>

      {isTrialMode && (
        <div className="trial-banner">
          <Info size={16} />
          <span>
            Bạn đang ở chế độ dùng thử. <Link to="/login">Đăng nhập</Link> để
            lưu thiệp!
          </span>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p className="error">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-card-form designer-form">
        <div className="designer-meta">
          {templates.length > 0 && (
            <div className="form-group">
              <label htmlFor="template_id">
                Chọn mẫu thiệp (không bắt buộc)
              </label>
              <select
                id="template_id"
                name="template_id"
                value={formData.template_id}
                onChange={handleChange}
              >
                <option value="">-- Không chọn mẫu --</option>
                {templates.map((template) => (
                  <option
                    key={template.template_id}
                    value={template.template_id}
                  >
                    {template.name} ({template.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Tiêu đề thiệp *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ví dụ: Lời mời dự tiệc cưới"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả (không bắt buộc)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả hoặc lời nhắn chính"
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
            {saving
              ? "Đang tạo..."
              : isTrialMode
                ? "Đăng nhập để lưu"
                : "Tạo thiệp"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/cards")}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateCard;
