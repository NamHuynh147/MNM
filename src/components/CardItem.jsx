// CardItem.jsx
import React from "react";
import { Calendar, Clock, Eye, Edit, Trash2, Star } from "lucide-react";

const CardItem = ({ card, onView, onEdit, onDelete }) => {
  return (
    <div className="card-item">
      <div className="card-preview-container">
        <div className="card-mini-preview">
          <div className="preview-content">
            <h3>{card.title}</h3>
            <div className="template">{card.template}</div>
            <div className="description">{card.description}</div>
          </div>
        </div>
        {card.isFeatured && (
          <div className="card-badge">
            <Star size={12} />
            Featured
          </div>
        )}
      </div>

      <div className="card-info">
        <div className="card-title">{card.title}</div>
        <div className="card-description">{card.description}</div>
        <div className="card-meta">
          <div className="meta-date">
            <Calendar size={14} />
            Created: {new Date(card.createdAt).toLocaleDateString()}
          </div>
          <div className="meta-updated">
            <Clock size={14} />
            Updated: {new Date(card.updatedAt).toLocaleDateString()}
          </div>
        </div>
        <div className="design-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${card.progress || 0}%` }}
            ></div>
          </div>
          <span className="progress-text">{card.progress || 0}%</span>
        </div>
      </div>

      <div className="card-actions">
        <button className="btn-view" onClick={() => onView(card)}>
          <Eye size={16} />
          View
        </button>
        <button className="btn-edit" onClick={() => onEdit(card)}>
          <Edit size={16} />
          Edit
        </button>
        <button className="btn-delete" onClick={() => onDelete(card.id)}>
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  );
};

export default CardItem;
