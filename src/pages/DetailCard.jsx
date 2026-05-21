import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CardDesigner from "../components/CardDesigner";
import * as api from "../services/api";
import "../styles/DetailCard.css";
import {
  Heart,
  Eye,
  Calendar,
  User,
  Globe,
  Lock,
  Copy,
  Edit,
  Trash2,
  Printer,
  ArrowLeft,
} from "lucide-react";

function DetailCard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    // Get current user
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    fetchCard();
  }, [id]);

  const fetchCard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      // Pass token to getCardById for authenticated requests
      const data = await api.getCardById(id, token);
      setCard(data);
      setLikeCount(data.likes || 0);
      setError(null);

      // Check if current user has liked this card
      if (isLoggedIn && token) {
        try {
          const likeStatus = await api.getLikeStatus(id, token);
          setLiked(likeStatus.liked);
        } catch (err) {
          console.error("Error checking like status:", err);
        }
      }
    } catch (err) {
      console.error("Error fetching card:", err);
      setError(err.message || "Không thể lấy thông tin thiệp");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Bạn chắc chắn muốn xóa thiệp này? Hành động này không thể hoàn tác.",
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      await api.deleteCard(id, token);
      navigate("/cards");
    } catch (err) {
      setError("Lỗi xóa thiệp: " + (err.message || "Vui lòng thử lại"));
      console.error(err);
    }
  };

  const handleLike = async () => {
    if (!isLoggedIn) {
      if (window.confirm("Bạn cần đăng nhập để thích thiệp. Đăng nhập ngay?")) {
        navigate("/login");
      }
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const result = await api.likeCard(id, token);
      setLiked(result.liked);
      setLikeCount(result.likes);
    } catch (err) {
      console.error("Error liking card:", err);
      setError("Không thể thích thiệp. Vui lòng thử lại.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleUseAsTemplate = async () => {
    if (!isLoggedIn) {
      if (
        window.confirm("Bạn cần đăng nhập để sử dụng mẫu này. Đăng nhập ngay?")
      ) {
        navigate("/login");
      }
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const newCard = {
        title: `${card.title} (Sao chép)`,
        description: card.description,
        design_data: card.design_data,
        template_id: card.template_id,
        is_public: false,
      };

      const createdCard = await api.createCard(newCard, token);
      alert("Đã thêm mẫu thiệp vào bộ sưu tập của bạn!");

      if (window.confirm("Bạn có muốn chỉnh sửa thiệp vừa thêm không?")) {
        navigate(`/cards/${createdCard.card_id}/edit`);
      } else {
        navigate("/cards");
      }
    } catch (err) {
      console.error("Use as template error:", err);
      setError(
        "Không thể sao chép thiệp: " + (err.message || "Vui lòng thử lại"),
      );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Check if current user is the owner
  const isOwner =
    currentUser &&
    card &&
    (currentUser.id === card.user_id || currentUser.user_id === card.user_id);
  const isAdmin = currentUser?.role === "admin";
  const canEdit = isOwner || isAdmin;
  const canDelete = isOwner || isAdmin;

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

  if (error) {
    return (
      <div className="container">
        <div className="error-state">
          <p className="error">{error}</p>
          <button onClick={() => navigate(-1)} className="btn-primary">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="container">
        <div className="empty-state">
          <p>Không tìm thấy thiệp</p>
          <Link to="/cards/public" className="btn-primary">
            Khám phá thiệp
          </Link>
        </div>
      </div>
    );
  }

  const designData = card.design_data || {};

  return (
    <div className="container detail-container">
      {/* Header */}
      <div className="detail-header">
        <div className="header-left">
          <Link
            to={isLoggedIn ? "/cards" : "/cards/public"}
            className="btn-back"
          >
            <ArrowLeft size={18} />
            Quay lại
          </Link>
          <div className="title-section">
            <h1>{card.title}</h1>
            <span
              className={`visibility-badge ${card.is_public ? "public" : "private"}`}
            >
              {card.is_public ? <Globe size={14} /> : <Lock size={14} />}
              {card.is_public ? "Công khai" : "Riêng tư"}
            </span>
          </div>
        </div>
        {!isOwner && card.is_public && (
          <button onClick={handleUseAsTemplate} className="btn-template">
            <Copy size={16} />
            Dùng làm mẫu
          </button>
        )}
      </div>

      <div className="detail-content">
        {/* Card Preview */}
        <div className="card-preview-large">
          <CardDesigner
            value={designData}
            title={card.title}
            description={card.description}
            readOnly
          />
        </div>

        {/* Card Info Sidebar */}
        <div className="card-info-sidebar">
          {/* Like Section */}
          <div className="like-section">
            <button
              className={`like-button ${liked ? "liked" : ""}`}
              onClick={handleLike}
            >
              <Heart size={24} fill={liked ? "currentColor" : "none"} />
              <span className="like-count">{likeCount}</span>
            </button>
            <p className="like-text">
              {liked ? "Bạn đã thích" : "Thích thiệp này"}
            </p>
          </div>

          {/* Stats */}
          <div className="stats-section">
            <div className="stat-item">
              <Eye size={16} />
              <span>{card.views || 0} lượt xem</span>
            </div>
            <div className="stat-item">
              <Calendar size={16} />
              <span>
                Tạo: {new Date(card.created_at).toLocaleDateString("vi-VN")}
              </span>
            </div>
            {card.updated_at && card.updated_at !== card.created_at && (
              <div className="stat-item">
                <Calendar size={16} />
                <span>
                  Cập nhật:{" "}
                  {new Date(card.updated_at).toLocaleDateString("vi-VN")}
                </span>
              </div>
            )}
            <div className="stat-item">
              <User size={16} />
              <span>Tác giả: {card.author_name || "Người dùng"}</span>
            </div>
          </div>

          {/* Card Details */}
          <div className="details-section">
            <h3>Thông tin thiệp</h3>

            {card.description && (
              <div className="detail-group">
                <label>Mô tả:</label>
                <p>{card.description}</p>
              </div>
            )}

            <div className="detail-group">
              <label>Mẫu thiệp:</label>
              <p>{card.template_name || "Không có mẫu"}</p>
            </div>

            <div className="detail-group">
              <label>Cấu hình:</label>
              <ul>
                <li>
                  Màu nền:
                  <span
                    className="color-preview"
                    style={{
                      backgroundColor: designData.backgroundColor || "#fff7ed",
                    }}
                  >
                    {designData.backgroundColor || "#fff7ed"}
                  </span>
                </li>
                <li>Số thành phần: {designData.elements?.length || 0}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="detail-actions">
        <button onClick={handlePrint} className="btn-print">
          <Printer size={16} />
          In thiệp
        </button>

        {canEdit && (
          <Link to={`/cards/${id}/edit`} className="btn-edit">
            <Edit size={16} />
            Chỉnh sửa
          </Link>
        )}

        {canDelete && (
          <button onClick={handleDelete} className="btn-delete">
            <Trash2 size={16} />
            Xóa
          </button>
        )}
      </div>

      {/* Owner Info (only shown if not owner) */}
      {!isOwner && card.author_name && (
        <div className="owner-info">
          <p>
            ✨ Thiệp được chia sẻ bởi <strong>{card.author_name}</strong>
          </p>
          <p className="owner-hint">
            Bạn có thể sử dụng thiệp này làm mẫu để tạo thiệp riêng của mình
          </p>
        </div>
      )}
    </div>
  );
}

export default DetailCard;
