// PublicCardList.jsx - Browse public cards from all users
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as api from "../services/api";
import "../styles/CardList.css";
import {
  Eye,
  Search,
  X,
  FileText,
  Calendar,
  Globe,
  User,
  Heart,
  Copy,
  Lock,
  TrendingUp,
  Sparkles,
} from "lucide-react";

function PublicCardList() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [likedCards, setLikedCards] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    fetchPublicCards();
  }, [sortBy]);

  useEffect(() => {
    if (isLoggedIn && cards.length > 0) {
      checkLikeStatuses();
    }
  }, [cards, isLoggedIn]);
  // Refresh like statuses when cards array changes
  useEffect(() => {
    if (isLoggedIn && cards.length > 0) {
      checkLikeStatuses();
    }
  }, [cards, isLoggedIn]); // This will run when cards change
  const fetchPublicCards = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getPublicCards({
        search: searchTerm,
        sort: sortBy,
      });
      const cardsArray = Array.isArray(data) ? data : data.cards || [];
      setCards(cardsArray);

      // Initialize like counts from card data
      const initialCounts = {};
      cardsArray.forEach((card) => {
        initialCounts[card.card_id] = card.likes || 0;
      });
      setLikeCounts(initialCounts);
    } catch (err) {
      console.error("Fetch public cards error:", err);
      setError(err.message || "Không thể lấy danh sách thiệp công khai");
    } finally {
      setLoading(false);
    }
  };

  const checkLikeStatuses = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const statuses = {};
      // Fetch like status for each card
      for (const card of cards) {
        try {
          const result = await api.getLikeStatus(card.card_id, token);
          statuses[card.card_id] = result.liked;
        } catch (err) {
          console.error(
            "Error checking like status for card",
            card.card_id,
            err,
          );
          statuses[card.card_id] = false;
        }
      }
      setLikedCards(statuses);
    } catch (err) {
      console.error("Error in checkLikeStatuses:", err);
    }
  };

  const handleLike = async (cardId) => {
    if (!isLoggedIn) {
      if (window.confirm("Bạn cần đăng nhập để thích thiệp. Đăng nhập ngay?")) {
        navigate("/login");
      }
      return;
    }

    // Get current state
    const isCurrentlyLiked = likedCards[cardId];
    const currentCount = likeCounts[cardId] || 0;

    // Optimistic update
    setLikedCards((prev) => ({ ...prev, [cardId]: !isCurrentlyLiked }));
    setLikeCounts((prev) => ({
      ...prev,
      [cardId]: currentCount + (isCurrentlyLiked ? -1 : 1),
    }));

    try {
      const token = localStorage.getItem("token");
      const result = await api.likeCard(cardId, token);

      // Update with actual server response
      setLikedCards((prev) => ({ ...prev, [cardId]: result.liked }));
      setLikeCounts((prev) => ({ ...prev, [cardId]: result.likes }));

      // Also update the cards array
      setCards((prevCards) =>
        prevCards.map((card) =>
          card.card_id === cardId ? { ...card, likes: result.likes } : card,
        ),
      );
    } catch (err) {
      console.error("Error toggling like:", err);
      // Revert on error
      setLikedCards((prev) => ({ ...prev, [cardId]: isCurrentlyLiked }));
      setLikeCounts((prev) => ({ ...prev, [cardId]: currentCount }));
      setError("Không thể thích thiệp. Vui lòng thử lại.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleSearch = () => {
    fetchPublicCards();
  };

  const handleUseAsTemplate = async (card) => {
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Hôm nay";
      if (diffDays === 1) return "Hôm qua";
      if (diffDays < 7) return `${diffDays} ngày trước`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
      return `${Math.floor(diffDays / 365)} năm trước`;
    } catch (err) {
      return "Invalid date";
    }
  };

  const renderCardPreview = (card) => {
    const designData = card.design_data || {};
    const backgroundColor = designData.backgroundColor || "#fff7ed";
    const elements = designData.elements || [];
    const previewElements = elements.slice(0, 3);

    const previewStyle = {
      backgroundColor: backgroundColor,
      position: "relative",
      width: "100%",
      height: "100%",
      overflow: "hidden",
    };

    return (
      <div className="card-mini-preview" style={previewStyle}>
        <div
          className="preview-content"
          style={{ position: "relative", width: "100%", height: "100%" }}
        >
          {previewElements.map((element, idx) => {
            if (element.type === "text") {
              return (
                <div
                  key={idx}
                  style={{
                    position: "absolute",
                    left: `${((element.x || 0) / 900) * 100}%`,
                    top: `${((element.y || 0) / 540) * 100}%`,
                    transform: "translate(-50%, -50%)",
                    fontSize: `${Math.min(element.fontSize || 16, 18)}px`,
                    color: element.color || "#000",
                    maxWidth: "80%",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontWeight: "500",
                  }}
                >
                  {element.text?.substring(0, 30) || "Text"}
                </div>
              );
            }
            if (element.type === "sticker") {
              return (
                <div
                  key={idx}
                  style={{
                    position: "absolute",
                    left: `${((element.x || 0) / 900) * 100}%`,
                    top: `${((element.y || 0) / 540) * 100}%`,
                    transform: "translate(-50%, -50%)",
                    fontSize: `${Math.min(element.fontSize || 32, 36)}px`,
                  }}
                >
                  {element.text || "★"}
                </div>
              );
            }
            if (element.type === "image" && element.src) {
              return (
                <div
                  key={idx}
                  style={{
                    position: "absolute",
                    left: `${((element.x || 0) / 900) * 100}%`,
                    top: `${((element.y || 0) / 540) * 100}%`,
                    transform: "translate(-50%, -50%)",
                    width: `${Math.min((element.width || 100) / 9, 60)}%`,
                    height: "auto",
                  }}
                >
                  <img
                    src={element.src}
                    alt="Preview"
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "60px",
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              );
            }
            return null;
          })}
          {elements.length === 0 && (
            <div className="preview-placeholder">
              <FileText size={32} />
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton-card"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>
            <Globe
              size={28}
              style={{
                display: "inline",
                marginRight: "10px",
                verticalAlign: "middle",
              }}
            />
            Khám Phá Thiệp Công Khai
          </h1>
          <p className="subtitle">
            Cảm hứng từ những thiệp đẹp được chia sẻ bởi cộng đồng
          </p>
        </div>
        {isLoggedIn && (
          <Link to="/cards" className="btn-secondary">
            <Lock size={18} style={{ marginRight: "5px" }} />
            Thiệp Của Tôi
          </Link>
        )}
      </div>

      {/* Search and Sort Bar */}
      <div className="search-filter-bar">
        <div className="search-box">
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#999",
            }}
          />
          <input
            type="text"
            placeholder="Tìm kiếm thiệp công khai..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            style={{ paddingLeft: "35px" }}
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => {
                setSearchTerm("");
                fetchPublicCards();
              }}
            >
              <X size={16} />
            </button>
          )}
          <button onClick={handleSearch} className="btn-search">
            Tìm
          </button>
        </div>

        <div className="sort-buttons">
          <button
            className={sortBy === "latest" ? "active" : ""}
            onClick={() => setSortBy("latest")}
          >
            <Sparkles size={16} /> Mới nhất
          </button>
          <button
            className={sortBy === "popular" ? "active" : ""}
            onClick={() => setSortBy("popular")}
          >
            <TrendingUp size={16} /> Phổ biến
          </button>
          <button
            className={sortBy === "most_viewed" ? "active" : ""}
            onClick={() => setSortBy("most_viewed")}
          >
            <Eye size={16} /> Xem nhiều
          </button>
        </div>
      </div>

      {error ? (
        <div className="error-state">
          <p className="error">{error}</p>
          <button onClick={fetchPublicCards} className="btn-primary">
            Thử lại
          </button>
        </div>
      ) : cards.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Globe size={64} />
          </div>
          <h3>Chưa có thiệp công khai nào</h3>
          <p>Hãy là người đầu tiên chia sẻ thiệp của bạn với cộng đồng!</p>
          {isLoggedIn && (
            <Link to="/cards" className="btn-primary">
              Đến trang thiệp của tôi
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="cards-stats">
            <Sparkles size={16} />
            Tìm thấy {cards.length} thiệp công khai
          </div>
          <div className="cards-grid public-grid">
            {cards.map((card) => (
              <div key={card.card_id} className="card-item public-card">
                <Link to={`/cards/${card.card_id}`} className="card-link">
                  <div className="card-preview-container">
                    {renderCardPreview(card)}
                    <div className="card-author">
                      <User size={14} />
                      <span>{card.author_name || "Người dùng"}</span>
                    </div>
                  </div>

                  <div className="card-info">
                    <h3 className="card-title">{card.title}</h3>
                    {card.description && (
                      <p className="card-description">
                        {card.description.substring(0, 60)}
                        {card.description.length > 60 ? "..." : ""}
                      </p>
                    )}
                  </div>
                </Link>

                <div className="card-stats-bar">
                  <button
                    className={`stat-btn like-btn ${likedCards[card.card_id] ? "liked" : ""}`}
                    onClick={() => handleLike(card.card_id)}
                  >
                    <Heart
                      size={16}
                      fill={likedCards[card.card_id] ? "currentColor" : "none"}
                    />
                    <span>{likeCounts[card.card_id] || card.likes || 0}</span>
                  </button>

                  <div className="stat-btn">
                    <Eye size={16} />
                    <span>{card.views || 0}</span>
                  </div>

                  <div className="stat-btn">
                    <Calendar size={16} />
                    <span>{formatDate(card.created_at)}</span>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="btn-use-template"
                    onClick={() => handleUseAsTemplate(card)}
                  >
                    <Copy size={16} />
                    Dùng làm mẫu
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default PublicCardList;
