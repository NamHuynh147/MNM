import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as api from "../services/api";
import "../styles/CardList.css";
import {
  Eye,
  Plus,
  Search,
  X,
  Clock,
  Edit,
  Trash2,
  FileText,
  Grid,
  Calendar,
} from "lucide-react";

function CardList() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, recent, oldest

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const data = await api.getCards();
      setCards(data);
      setError(null);
    } catch (err) {
      setError("Không thể lấy danh sách thiệp");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa thiệp này?")) {
      try {
        await api.deleteCard(id);
        setCards(cards.filter((card) => card.card_id !== id));
      } catch (err) {
        setError("Lỗi xóa thiệp");
      }
    }
  };

  // Filter and sort cards
  const getFilteredCards = () => {
    let filtered = [...cards];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (card) =>
          card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (card.description &&
            card.description.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }

    // Sort filter
    switch (filter) {
      case "recent":
        filtered.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at),
        );
        break;
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at),
        );
    }

    return filtered;
  };

  // Render mini preview of the card design
  // Render mini preview of the card design
  const renderCardPreview = (card) => {
    const designData = card.design_data || {};
    const backgroundColor = designData.backgroundColor || "#fff7ed";
    const backgroundImage = designData.backgroundImage || null;
    const elements = designData.elements || [];

    // Get first few elements for preview
    const previewElements = elements.slice(0, 5);

    // Preview style with optional background image
    const previewStyle = {
      backgroundColor: backgroundImage ? "transparent" : backgroundColor,
      backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
      backgroundSize: "cover",
      backgroundPosition: "center",
      position: "relative",
      width: "100%",
      height: "100%",
    };

    return (
      <div className="card-mini-preview" style={previewStyle}>
        <div className="preview-content">
          {previewElements.map((element, idx) => {
            // Calculate position percentages
            const leftPercent = ((element.x || 0) / 900) * 100;
            const topPercent = ((element.y || 0) / 540) * 100;

            const baseStyle = {
              position: "absolute",
              left: `${leftPercent}%`,
              top: `${topPercent}%`,
              transform: "translate(-50%, -50%)",
              maxWidth: "80%",
              pointerEvents: "none",
            };

            // Handle different element types
            if (element.type === "text") {
              const style = {
                ...baseStyle,
                fontSize: `${Math.min(element.fontSize || 16, 20)}px`,
                fontFamily: element.fontFamily || "Arial",
                color: element.color || "#000",
                fontWeight: element.bold ? "bold" : "normal",
                fontStyle: element.italic ? "italic" : "normal",
                textAlign: element.textAlign || "left",
                backgroundColor:
                  element.backgroundColor !== "transparent"
                    ? element.backgroundColor
                    : "transparent",
                padding: "2px 4px",
                borderRadius: "4px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              };

              return (
                <div key={idx} style={style}>
                  {element.text ? element.text.substring(0, 20) : "Text"}
                </div>
              );
            }

            if (element.type === "sticker") {
              const style = {
                ...baseStyle,
                fontSize: `${Math.min(element.fontSize || 32, 40)}px`,
              };
              return (
                <div key={idx} style={style}>
                  {element.emoji || element.text || "😊"}
                </div>
              );
            }

            if (element.type === "image") {
              const style = {
                ...baseStyle,
                width: `${Math.min((element.width || 100) / 9, 80)}%`,
                height: "auto",
                maxHeight: "40%",
              };

              return (
                <img
                  key={idx}
                  src={element.src || element.url}
                  alt={element.alt || "Preview"}
                  style={style}
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.target.style.display = "none";
                    const fallback = document.createElement("div");
                    fallback.textContent = "🖼️";
                    fallback.style.cssText = `${style.cssText} font-size: 32px; display: flex; align-items: center; justify-content: center;`;
                    e.target.parentNode.appendChild(fallback);
                  }}
                />
              );
            }

            if (element.type === "shape") {
              const style = {
                ...baseStyle,
                width: `${Math.min((element.width || 50) / 9, 60)}%`,
                height: `${Math.min((element.height || 50) / 5.4, 60)}%`,
                backgroundColor: element.color || "#ccc",
                borderRadius:
                  element.shape === "circle"
                    ? "50%"
                    : element.shape === "rounded"
                      ? "10px"
                      : "0",
                opacity: element.opacity || 1,
              };
              return <div key={idx} style={style}></div>;
            }

            return null;
          })}
        </div>
        {elements.length === 0 && (
          <div className="preview-placeholder">
            <FileText size={48} />
            <p>Chưa có nội dung</p>
          </div>
        )}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredCards = getFilteredCards();

  if (loading)
    return (
      <div className="container">
        <div className="loading-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-card"></div>
            ))}
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="container">
        <div className="error-state">
          <p className="error">{error}</p>
          <button onClick={fetchCards} className="btn-primary">
            Thử lại
          </button>
        </div>
      </div>
    );

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>
            <Grid
              size={28}
              style={{
                display: "inline",
                marginRight: "10px",
                verticalAlign: "middle",
              }}
            />
            Danh Sách Thiệp Của Tôi
          </h1>
          <p className="subtitle">Quản lý và tùy chỉnh các thiệp của bạn</p>
        </div>
        <Link to="/cards/create" className="btn-primary">
          <Plus size={18} style={{ marginRight: "5px" }} />
          Tạo Thiệp Mới
        </Link>
      </div>

      {/* Search and Filter Bar */}
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
            placeholder="Tìm kiếm thiệp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: "35px" }}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm("")}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="filter-buttons">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            Mới nhất
          </button>
          <button
            className={filter === "recent" ? "active" : ""}
            onClick={() => setFilter("recent")}
          >
            Mới tạo
          </button>
          <button
            className={filter === "oldest" ? "active" : ""}
            onClick={() => setFilter("oldest")}
          >
            Cũ nhất
          </button>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FileText size={64} />
          </div>
          <h3>Chưa có thiệp nào</h3>
          <p>Hãy tạo một thiệp mới để bắt đầu!</p>
          <Link to="/cards/create" className="btn-primary">
            Tạo Thiệp Đầu Tiên
          </Link>
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="empty-state">
          <p>Không tìm thấy thiệp nào phù hợp với "{searchTerm}"</p>
          <button onClick={() => setSearchTerm("")} className="btn-secondary">
            Xóa tìm kiếm
          </button>
        </div>
      ) : (
        <>
          <div className="cards-stats">
            Hiển thị {filteredCards.length} / {cards.length} thiệp
          </div>

          <div className="cards-grid">
            {filteredCards.map((card) => (
              <div key={card.card_id} className="card-item">
                {/* Card Preview */}
                <div className="card-preview-container">
                  {renderCardPreview(card)}

                  {/* Badge for template type */}
                  {card.template_name && (
                    <span className="card-badge">{card.template_name}</span>
                  )}
                </div>

                {/* Card Info */}
                <div className="card-info">
                  <h3 className="card-title">{card.title}</h3>
                  {card.description && (
                    <p className="card-description">{card.description}</p>
                  )}

                  <div className="card-meta">
                    <span className="meta-date">
                      <Calendar
                        size={14}
                        style={{
                          marginRight: "4px",
                          display: "inline",
                          verticalAlign: "middle",
                        }}
                      />
                      {formatDate(card.created_at)}
                    </span>
                    {card.updated_at !== card.created_at && (
                      <span className="meta-updated">
                        <Edit
                          size={14}
                          style={{
                            marginRight: "4px",
                            display: "inline",
                            verticalAlign: "middle",
                          }}
                        />
                        Cập nhật: {formatDate(card.updated_at)}
                      </span>
                    )}
                  </div>

                  {/* Progress indicator for design completion */}
                  {card.design_data?.elements && (
                    <div className="design-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min((card.design_data.elements.length / 5) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {card.design_data.elements.length} thành phần
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="card-actions">
                  <Link
                    to={`/cards/${card.card_id}`}
                    className="btn-view"
                    title="Xem chi tiết"
                  >
                    <Eye size={16} style={{ marginRight: "5px" }} />
                    Xem
                  </Link>
                  <Link
                    to={`/cards/${card.card_id}/edit`}
                    className="btn-edit"
                    title="Chỉnh sửa"
                  >
                    <Edit size={16} style={{ marginRight: "5px" }} />
                    Sửa
                  </Link>
                  <button
                    onClick={() => handleDelete(card.card_id)}
                    className="btn-delete"
                    title="Xóa thiệp"
                  >
                    <Trash2 size={16} style={{ marginRight: "5px" }} />
                    Xóa
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

export default CardList;
