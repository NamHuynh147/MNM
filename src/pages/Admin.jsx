import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../services/api";
import {
  Globe,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  FileText,
  User,
  Tag,
  Hash,
  CheckCircle,
  AlertCircle,
  Grid,
} from "lucide-react";
import "../styles/Admin.css";

const emptyForm = {
  card_id: null,
  template_id: "",
  title: "",
  description: "",
  backgroundColor: "#fff7ed",
  is_public: false,
};

function Admin() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (savedUser) {
      const userData = JSON.parse(savedUser);
      if (userData.role !== "admin") {
        window.location.href = "/";
        return;
      }
      setUser(userData);
    }

    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No token found");
      }

      const testResponse = await fetch(
        "http://localhost:5000/api/cards/admin-test",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!testResponse.ok) {
        throw new Error("Admin access required");
      }

      const allCards = await api.getAllCards({}, token);
      const templatesData = await api.getTemplates();

      const cardsArray = Array.isArray(allCards) ? allCards : [];
      setCards(cardsArray);
      setTemplates(templatesData);
      setError("");
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError(
        "Không thể tải dữ liệu admin: " + (err.message || "Vui lòng thử lại"),
      );

      if (err.message.includes("Admin") || err.message.includes("token")) {
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredCards = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return cards;

    return cards.filter((card) => {
      const title = card.title?.toLowerCase() || "";
      const description = card.description?.toLowerCase() || "";
      const templateName = card.template_name?.toLowerCase() || "";
      const authorName = card.author_name?.toLowerCase() || "";
      return (
        title.includes(keyword) ||
        description.includes(keyword) ||
        templateName.includes(keyword) ||
        authorName.includes(keyword)
      );
    });
  }, [cards, search]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setError("");
    setMessage("");
  };

  const handleEdit = (card) => {
    navigate(`/cards/${card.card_id}/edit`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!formData.title.trim()) {
      setError("Vui lòng nhập tiêu đề thiệp");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vui lòng đăng nhập lại");
      return;
    }

    const payload = {
      template_id: formData.template_id ? Number(formData.template_id) : null,
      title: formData.title.trim(),
      description: formData.description.trim(),
      design_data: {
        backgroundColor: formData.backgroundColor,
        elements: [],
      },
      is_public: formData.is_public,
    };

    try {
      setSaving(true);
      if (formData.card_id) {
        const updatedCard = await api.updateCard(
          formData.card_id,
          payload,
          token,
        );
        setCards((prev) =>
          prev.map((card) =>
            card.card_id === updatedCard.card_id
              ? {
                  ...card,
                  ...updatedCard,
                  template_name: getTemplateName(updatedCard.template_id),
                }
              : card,
          ),
        );
        setMessage("Đã cập nhật thiệp thành công");
        resetForm();
      } else {
        const newCard = await api.createCard(payload, token);
        setCards((prev) => [
          {
            ...newCard,
            template_name: getTemplateName(newCard.template_id),
            author_name: user?.name,
          },
          ...prev,
        ]);
        setMessage("Đã tạo thiệp mới thành công");
        resetForm();
      }
    } catch (err) {
      console.error("Error saving card:", err);
      setError(err.message || "Lưu thiệp thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (card) => {
    const confirmed = window.confirm(
      `Xóa thiệp "${card.title}"? Hành động này không thể hoàn tác.`,
    );
    if (!confirmed) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vui lòng đăng nhập lại");
      return;
    }

    try {
      await api.deleteCard(card.card_id, token);
      setCards((prev) => prev.filter((item) => item.card_id !== card.card_id));
      if (formData.card_id === card.card_id) resetForm();
      setMessage(`Đã xóa thiệp "${card.title}" thành công`);
      setError("");
    } catch (err) {
      console.error("Error deleting card:", err);
      setError("Xóa thiệp thất bại: " + (err.message || "Vui lòng thử lại"));
    }
  };

  const handleToggleVisibility = async (card) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const newVisibility = !card.is_public;
      const updatedCard = await api.toggleCardVisibility(
        card.card_id,
        newVisibility,
        token,
      );

      setCards((prev) =>
        prev.map((c) =>
          c.card_id === card.card_id
            ? { ...c, is_public: updatedCard.is_public }
            : c,
        ),
      );
      setMessage(
        `Đã ${newVisibility ? "công khai" : "ẩn"} thiệp "${card.title}" thành công`,
      );

      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error toggling visibility:", err);
      setError(
        "Không thể thay đổi trạng thái công khai: " +
          (err.message || "Vui lòng thử lại"),
      );
      setTimeout(() => setError(""), 3000);
    }
  };

  const getTemplateName = (templateId) => {
    if (!templateId) return "Không có mẫu";
    const template = templates.find(
      (item) => item.template_id === Number(templateId),
    );
    return template?.name || "Không có mẫu";
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-shell">
          <div className="loading-skeleton">
            <div className="skeleton-header"></div>
            <div className="skeleton-content"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <section className="admin-hero">
          <div>
            <p className="admin-kicker">Quản trị hệ thống</p>
            <h1>Quản lý thiệp mời</h1>
            <p>
              Quản lý tất cả thiệp trong hệ thống (bao gồm cả công khai và riêng
              tư của tất cả người dùng).
            </p>
          </div>
          <div className="admin-stats">
            <span>{cards.length}</span>
            <small>Tổng số thiệp</small>
            <button
              onClick={() => fetchAdminData()}
              className="btn-refresh"
              disabled={loading}
            >
              <RefreshCw size={14} />
              Làm mới
            </button>
          </div>
        </section>

        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            <p className="error">{error}</p>
          </div>
        )}
        {message && (
          <div className="success-message">
            <CheckCircle size={16} />
            <p className="success">{message}</p>
          </div>
        )}

        <section className="admin-layout">
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-section-title">
              <h2>
                <Plus size={18} />
                Tạo thiệp mới
              </h2>
            </div>

            <div className="form-group">
              <label htmlFor="title">
                <FileText size={14} />
                Tiêu đề *
              </label>
              <input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ví dụ: Mời dự tiệc sinh nhật"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="template_id">
                <Tag size={14} />
                Mẫu thiệp
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
                    {template.name} ({template.category || "Chung"})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">
                <FileText size={14} />
                Mô tả
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Nội dung ngắn hiển thị trên thiệp"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="backgroundColor">Màu nền</label>
              <div className="admin-color-row">
                <input
                  id="backgroundColor"
                  name="backgroundColor"
                  type="color"
                  value={formData.backgroundColor}
                  onChange={handleChange}
                />
                <span>{formData.backgroundColor}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_public"
                  checked={formData.is_public}
                  onChange={handleChange}
                />
                <Globe size={14} />
                <span>Công khai thiệp này</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn-primary admin-submit"
              disabled={saving}
            >
              {saving ? "Đang lưu..." : "Tạo thiệp"}
            </button>
          </form>

          <section className="admin-list-panel">
            <div className="admin-list-header">
              <div>
                <h2>
                  <Grid size={18} />
                  Tất cả thiệp trong hệ thống
                </h2>
                <p>
                  {filteredCards.length} / {cards.length} kết quả
                </p>
              </div>
              <div className="admin-search-wrapper">
                <Search size={16} className="search-icon" />
                <input
                  className="admin-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm theo tiêu đề, mô tả, tác giả..."
                />
                {search && (
                  <button
                    className="clear-search"
                    onClick={() => setSearch("")}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="admin-table">
              {filteredCards.length === 0 ? (
                <div className="admin-empty">
                  <FileText size={48} />
                  <p>Chưa có thiệp nào phù hợp.</p>
                </div>
              ) : (
                filteredCards.map((card) => (
                  <article className="admin-row" key={card.card_id}>
                    <div
                      className="admin-card-preview"
                      style={{
                        backgroundColor:
                          card.design_data?.backgroundColor || "#fff7ed",
                      }}
                    >
                      <span>{card.title?.charAt(0)?.toUpperCase() || "T"}</span>
                    </div>
                    <div className="admin-card-main">
                      <div className="admin-card-header">
                        <h3>{card.title}</h3>
                        <span
                          className={`visibility-badge ${card.is_public ? "public" : "private"}`}
                        >
                          {card.is_public ? (
                            <>
                              <Globe size={12} />
                              Công khai
                            </>
                          ) : (
                            <>
                              <Lock size={12} />
                              Riêng tư
                            </>
                          )}
                        </span>
                      </div>
                      <p>{card.description || "Chưa có mô tả"}</p>
                      <div className="admin-card-meta">
                        <small>
                          <Tag size={12} />
                          Mẫu: {getTemplateName(card.template_id)}
                        </small>
                        <small>
                          <User size={12} />
                          Tác giả: {card.author_name || "Unknown"}
                        </small>
                        <small>
                          <Hash size={12} />
                          ID: {card.card_id}
                        </small>
                      </div>
                    </div>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className={`btn-visibility-toggle ${card.is_public ? "public" : "private"}`}
                        onClick={() => handleToggleVisibility(card)}
                        title={
                          card.is_public
                            ? "Chuyển thành riêng tư"
                            : "Chuyển thành công khai"
                        }
                      >
                        {card.is_public ? (
                          <>
                            <EyeOff size={14} />
                            Ẩn
                          </>
                        ) : (
                          <>
                            <Eye size={14} />
                            Công khai
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleEdit(card)}
                      >
                        <Edit size={14} />
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => handleDelete(card)}
                      >
                        <Trash2 size={14} />
                        Xóa
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}

export default Admin;
