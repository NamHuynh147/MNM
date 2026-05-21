import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as api from "../services/api";
import "../styles/CardList.css";
import {
  Eye,
  Plus,
  Search,
  X,
  Edit,
  Trash2,
  FileText,
  Grid,
  Calendar,
  Globe,
  Lock,
  Copy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function CardList() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage] = useState(3);

  const isLoggedIn = !!localStorage.getItem("token");

  // Get current user from localStorage
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        } catch (err) {
          console.error("Error parsing user:", err);
        }
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchCards();
    } else {
      setLoading(false);
    }
  }, [user, isLoggedIn]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No token found");
      }

      const data = await api.getMyCards(token);
      const cardsArray = Array.isArray(data) ? data : data.cards || [];
      setCards(cardsArray);
    } catch (err) {
      console.error("Fetch cards error:", err);
      setError(err.message || "Không thể lấy danh sách thiệp của bạn");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!isLoggedIn) {
      alert("Vui lòng đăng nhập để xóa thiệp");
      navigate("/login");
      return;
    }

    if (!window.confirm("Bạn chắc chắn muốn xóa thiệp này?")) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await api.deleteCard(id, token);
      setCards(cards.filter((card) => card.card_id !== id));
      // Reset to first page if current page has no cards after deletion
      const newFilteredCards = getFilteredCards().filter(
        (card) => card.card_id !== id,
      );
      const newTotalPages = Math.ceil(newFilteredCards.length / cardsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      } else if (newTotalPages === 0) {
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError("Lỗi xóa thiệp: " + (err.message || "Vui lòng thử lại"));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (cardId, currentStatus) => {
    if (!isLoggedIn) {
      alert("Vui lòng đăng nhập để thay đổi quyền riêng tư");
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const updatedCard = await api.toggleCardVisibility(
        cardId,
        !currentStatus,
        token,
      );

      setCards(
        cards.map((card) =>
          card.card_id === cardId
            ? {
                ...card,
                is_public: !currentStatus,
                published_at: !currentStatus ? new Date().toISOString() : null,
              }
            : card,
        ),
      );

      const message = !currentStatus
        ? "Thiệp đã được chia sẻ công khai!"
        : "Thiệp đã chuyển về chế độ riêng tư";
      alert(message);
    } catch (err) {
      console.error("Toggle visibility error:", err);
      setError("Không thể cập nhật trạng thái công khai");
    }
  };

  const handleDuplicate = async (card) => {
    if (!isLoggedIn) {
      alert("Vui lòng đăng nhập để sao chép thiệp");
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const duplicatedCard = {
        title: `${card.title} (Sao chép)`,
        description: card.description,
        design_data: card.design_data,
        template_id: card.template_id,
        is_public: false,
      };

      const newCard = await api.createCard(duplicatedCard, token);
      setCards([newCard, ...cards]);
      alert("Đã sao chép thiệp thành công!");
    } catch (err) {
      console.error("Duplicate error:", err);
      setError("Không thể sao chép thiệp");
    }
  };

  const getFilteredCards = () => {
    let filtered = [...cards];

    if (searchTerm) {
      filtered = filtered.filter(
        (card) =>
          card.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (card.description &&
            card.description.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }

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
      case "public":
        filtered = filtered.filter((card) => card.is_public === true);
        break;
      case "private":
        filtered = filtered.filter((card) => card.is_public === false);
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

  // Pagination logic
  const filteredCards = getFilteredCards();
  const totalCards = filteredCards.length;
  const totalPages = Math.ceil(totalCards / cardsPerPage);
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredCards.slice(indexOfFirstCard, indexOfLastCard);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter]);

  const renderCardPreview = (card) => {
    const designData = card.design_data || {};
    const backgroundColor = designData.backgroundColor || "#fff7ed";
    const backgroundImage = designData.backgroundImage || null;
    const elements = designData.elements || [];
    const previewElements = elements.slice(0, 5);

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
                    e.target.style.display = "none";
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
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      return "Invalid date";
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="container">
        <div className="page-header">
          <h1>
            <Lock
              size={28}
              style={{
                display: "inline",
                marginRight: "10px",
                verticalAlign: "middle",
              }}
            />
            Thiệp Của Tôi
          </h1>
          <p className="subtitle">Đăng nhập để quản lý thiệp của bạn</p>
        </div>
        <div className="empty-state">
          <Lock size={64} />
          <h3>Bạn chưa đăng nhập</h3>
          <p>Vui lòng đăng nhập để xem và quản lý thiệp của bạn</p>
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              marginTop: "20px",
            }}
          >
            <Link to="/login" className="btn-primary">
              Đăng nhập
            </Link>
            <Link to="/register" className="btn-secondary">
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading)
    return (
      <div className="container">
        <div className="loading-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-grid">
            {[1, 2, 3].map((i) => (
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
            <Lock
              size={28}
              style={{
                display: "inline",
                marginRight: "10px",
                verticalAlign: "middle",
              }}
            />
            Thiệp Của Tôi
          </h1>
          <p className="subtitle">
            Quản lý thiệp cá nhân và chia sẻ với cộng đồng
          </p>
        </div>
        <div className="header-actions">
          <Link to="/cards/public" className="btn-secondary">
            <Globe size={18} style={{ marginRight: "5px" }} />
            Khám Phá
          </Link>
          <Link to="/cards/create" className="btn-primary">
            <Plus size={18} style={{ marginRight: "5px" }} />
            Tạo Thiệp Mới
          </Link>
        </div>
      </div>

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
            placeholder="Tìm kiếm thiệp của bạn..."
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
            Tất cả
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
          <button
            className={filter === "public" ? "active" : ""}
            onClick={() => setFilter("public")}
          >
            <Globe size={14} style={{ marginRight: "4px" }} />
            Công khai
          </button>
          <button
            className={filter === "private" ? "active" : ""}
            onClick={() => setFilter("private")}
          >
            <Lock size={14} style={{ marginRight: "4px" }} />
            Riêng tư
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
            Hiển thị {currentCards.length} / {totalCards} thiệp
            {totalPages > 1 && ` (Trang ${currentPage}/${totalPages})`}
          </div>

          <div className="cards-grid">
            {currentCards.map((card) => (
              <div key={card.card_id} className="card-item">
                <div className="card-preview-container">
                  {renderCardPreview(card)}
                  {card.template_name && (
                    <span className="card-badge">{card.template_name}</span>
                  )}
                  <span
                    className={`visibility-badge ${card.is_public ? "public" : "private"}`}
                  >
                    {card.is_public ? <Globe size={12} /> : <Lock size={12} />}
                    {card.is_public ? "Công khai" : "Riêng tư"}
                  </span>
                </div>

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

                <div className="card-actions">
                  <button
                    onClick={() =>
                      handleToggleVisibility(card.card_id, card.is_public)
                    }
                    className={`btn-visibility ${card.is_public ? "public" : "private"}`}
                    title={
                      card.is_public
                        ? "Chuyển thành riêng tư"
                        : "Chia sẻ công khai"
                    }
                  >
                    {card.is_public ? <Globe size={16} /> : <Lock size={16} />}
                    {card.is_public ? "Công khai" : "Chia sẻ"}
                  </button>

                  <button
                    onClick={() => handleDuplicate(card)}
                    className="btn-duplicate"
                    title="Sao chép thiệp"
                  >
                    <Copy size={16} style={{ marginRight: "5px" }} />
                    Sao chép
                  </button>

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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                <ChevronLeft size={16} />
                Trước
              </button>

              <div className="pagination-numbers">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  // Show first page, last page, and pages around current page
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 &&
                      pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`pagination-number ${currentPage === pageNumber ? "active" : ""}`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <span key={pageNumber} className="pagination-dots">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CardList;
