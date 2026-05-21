import React, { useEffect, useMemo, useRef, useState } from "react";
import "../styles/CardDesigner.css";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  Type,
  Square,
  Image as ImageIcon,
  Copy,
  Trash2,
  BringToFront,
  SendToBack,
  Palette,
  RotateCw,
} from "lucide-react";

const canvasSize = { width: 900, height: 540 };

const defaultFonts = [
  "Arial",
  "Georgia",
  "Times New Roman",
  "Verdana",
  "Courier New",
  "Roboto",
  "Open Sans",
  "Montserrat",
  "Lobster",
  "Pacifico",
];

const stickers = ["★", "♥", "✿", "❀", "✓", "🎂", "🎈", "🌸"];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createElement = (type, overrides = {}) => {
  const base = {
    id: makeId(),
    type,
    x: 120,
    y: 120,
    width: type === "text" ? 260 : 110,
    height: type === "text" ? 70 : 110,
    rotation: 0,
    color: "#243042",
    backgroundColor: type === "shape" ? "#ffd166" : "transparent",
    fontSize: type === "sticker" ? 48 : 28,
    fontFamily: "Arial",
    text: type === "text" ? "Nhập chữ" : type === "sticker" ? "★" : "",
    borderRadius: type === "shape" ? 18 : 0,
    zIndex: 1,
  };

  if (type === "image") {
    delete base.text;
  }

  return { ...base, ...overrides };
};

const normalizeDesign = (design, title = "", description = "") => {
  if (design?.elements?.length) {
    return {
      backgroundColor: design.backgroundColor || "#fff7ed",
      elements: design.elements,
    };
  }

  return {
    backgroundColor: design?.backgroundColor || "#fff7ed",
    elements: [
      createElement("text", {
        id: "title-layer",
        text: title || "Tiêu đề thiệp",
        x: 90,
        y: 110,
        width: 720,
        height: 90,
        fontSize: Number(design?.fontSize) || 42,
        fontFamily: design?.fontFamily || "Georgia",
        color: design?.textColor || "#7c2d12",
        zIndex: 1,
      }),
      createElement("text", {
        id: "message-layer",
        text: description || "Kéo thả chữ, hình, sticker để tự thiết kế thiệp.",
        x: 150,
        y: 250,
        width: 600,
        height: 90,
        fontSize: 24,
        fontFamily: design?.fontFamily || "Arial",
        color: design?.textColor || "#374151",
        zIndex: 2,
      }),
    ],
  };
};

const compressImage = (dataUrl, maxWidth = 1200, quality = 0.9) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png", quality));
      } else {
        resolve(dataUrl);
      }
    };
    img.src = dataUrl;
  });
};

// CKEditor cấu hình đơn giản hơn (tránh xung đột)
const ckEditorConfig = {
  toolbar: {
    items: [
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "|",
      "bulletedList",
      "numberedList",
      "|",
      "undo",
      "redo",
    ],
    shouldNotGroupWhenFull: true,
  },
  placeholder: "Nhập nội dung thiệp...",
  removePlugins: [
    "Title",
    "MediaEmbed",
    "Table",
    "TableToolbar",
    "TableProperties",
    "TableCellProperties",
  ],
  language: "vi",
};

function CardDesigner({
  value,
  title,
  description,
  onChange,
  readOnly = false,
}) {
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    elementId: null,
  });

  const design = useMemo(
    () => normalizeDesign(value, title, description),
    [value, title, description],
  );

  const selectedElement = design.elements.find(
    (element) => element.id === selectedId,
  );

  const emitChange = (nextDesign) => {
    const cleanDesign = {
      ...nextDesign,
      backgroundColor: nextDesign.backgroundColor || "#fff7ed",
      canvas: canvasSize,
    };

    onChange?.(cleanDesign);
  };

  useEffect(() => {
    if (!readOnly && !value?.elements?.length) {
      emitChange(design);
    }
  }, [readOnly, value?.elements?.length]);

  const updateElement = (id, updates) => {
    emitChange({
      ...design,
      elements: design.elements.map((element) =>
        element.id === id ? { ...element, ...updates } : element,
      ),
    });
  };

  const addElement = (type, overrides = {}) => {
    const maxZ = Math.max(
      0,
      ...design.elements.map((element) => element.zIndex || 0),
    );
    const nextElement = createElement(type, { ...overrides, zIndex: maxZ + 1 });
    emitChange({ ...design, elements: [...design.elements, nextElement] });
    setSelectedId(nextElement.id);
  };

  const deleteSelected = () => {
    if (!selectedElement) return;
    emitChange({
      ...design,
      elements: design.elements.filter(
        (element) => element.id !== selectedElement.id,
      ),
    });
    setSelectedId(null);
    setContextMenu({ visible: false, x: 0, y: 0, elementId: null });
  };

  const duplicateSelected = () => {
    if (!selectedElement) return;

    addElement(selectedElement.type, {
      ...selectedElement,
      id: makeId(),
      x: selectedElement.x + 24,
      y: selectedElement.y + 24,
    });
  };

  const moveLayer = (direction) => {
    if (!selectedElement) return;

    const currentZ = selectedElement.zIndex || 1;
    const targetZ = currentZ + direction;

    if (targetZ < 1 || targetZ > 99) return;

    const elementToSwap = design.elements.find(
      (el) => (el.zIndex || 1) === targetZ && el.id !== selectedElement.id,
    );

    if (elementToSwap) {
      updateElement(selectedElement.id, { zIndex: targetZ });
      updateElement(elementToSwap.id, { zIndex: currentZ });
    } else {
      updateElement(selectedElement.id, { zIndex: targetZ });
    }
  };

  const getCanvasPoint = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasSize.width / rect.width;
    const scaleY = canvasSize.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const handleResizeStart = (event, element, handle) => {
    event.preventDefault();
    event.stopPropagation();

    const startPoint = getCanvasPoint(event);
    resizeRef.current = {
      id: element.id,
      handle: handle,
      startX: startPoint.x,
      startY: startPoint.y,
      startWidth: element.width,
      startHeight: element.height,
      startXPos: element.x,
      startYPos: element.y,
    };
  };

  const handleResizeMove = (event) => {
    if (!resizeRef.current || readOnly) return;

    const currentPoint = getCanvasPoint(event);
    const {
      id,
      handle,
      startX,
      startY,
      startWidth,
      startHeight,
      startXPos,
      startYPos,
    } = resizeRef.current;
    const element = design.elements.find((item) => item.id === id);
    if (!element) return;

    let newWidth = startWidth;
    let newHeight = startHeight;
    let newX = startXPos;
    let newY = startYPos;

    const dx = currentPoint.x - startX;
    const dy = currentPoint.y - startY;

    switch (handle) {
      case "se":
        newWidth = Math.max(30, startWidth + dx);
        newHeight = Math.max(30, startHeight + dy);
        break;
      case "sw":
        newWidth = Math.max(30, startWidth - dx);
        newX = startXPos + (startWidth - newWidth);
        newHeight = Math.max(30, startHeight + dy);
        break;
      case "ne":
        newWidth = Math.max(30, startWidth + dx);
        newHeight = Math.max(30, startHeight - dy);
        newY = startYPos + (startHeight - newHeight);
        break;
      case "nw":
        newWidth = Math.max(30, startWidth - dx);
        newX = startXPos + (startWidth - newWidth);
        newHeight = Math.max(30, startHeight - dy);
        newY = startYPos + (startHeight - newHeight);
        break;
      case "e":
        newWidth = Math.max(30, startWidth + dx);
        break;
      case "w":
        newWidth = Math.max(30, startWidth - dx);
        newX = startXPos + (startWidth - newWidth);
        break;
      case "s":
        newHeight = Math.max(30, startHeight + dy);
        break;
      case "n":
        newHeight = Math.max(30, startHeight - dy);
        newY = startYPos + (startHeight - newHeight);
        break;
    }

    newX = clamp(newX, 0, canvasSize.width - newWidth);
    newY = clamp(newY, 0, canvasSize.height - newHeight);

    updateElement(id, {
      width: newWidth,
      height: newHeight,
      x: newX,
      y: newY,
    });
  };

  const handleResizeEnd = () => {
    resizeRef.current = null;
  };

  const handlePointerDown = (event, element) => {
    if (readOnly) return;

    // Chỉ bắt đầu kéo khi click vào element, không phải resize handle
    if (event.target.classList?.contains("resize-handle")) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);

    const point = getCanvasPoint(event);
    dragRef.current = {
      id: element.id,
      offsetX: point.x - element.x,
      offsetY: point.y - element.y,
    };
    setSelectedId(element.id);
  };

  const handlePointerMove = (event) => {
    if (resizeRef.current) {
      handleResizeMove(event);
    } else if (dragRef.current && !readOnly) {
      const point = getCanvasPoint(event);
      const element = design.elements.find(
        (item) => item.id === dragRef.current.id,
      );
      if (!element) return;

      updateElement(element.id, {
        x: clamp(
          point.x - dragRef.current.offsetX,
          0,
          canvasSize.width - element.width,
        ),
        y: clamp(
          point.y - dragRef.current.offsetY,
          0,
          canvasSize.height - element.height,
        ),
      });
    }
  };

  const handlePointerUp = () => {
    dragRef.current = null;
    handleResizeEnd();
  };

  const handleDrop = (event) => {
    if (readOnly) return;
    event.preventDefault();
    event.stopPropagation();

    const payload = JSON.parse(
      event.dataTransfer.getData("application/json") || "{}",
    );
    if (!payload.type) return;

    const point = getCanvasPoint(event);
    addElement(payload.type, {
      text: payload.text,
      x: clamp(point.x - 55, 0, canvasSize.width - 110),
      y: clamp(point.y - 55, 0, canvasSize.height - 110),
    });
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(
        "Image size should be less than 5MB. Please choose a smaller image.",
      );
      event.target.value = "";
      return;
    }

    setUploadingImage(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const compressedImage = await compressImage(
            e.target.result,
            1200,
            0.9,
          );
          addElement("image", {
            src: compressedImage,
            x: 160,
            y: 130,
            width: 300,
            height: 200,
          });
        } catch (error) {
          console.error("Error processing image:", error);
          alert("Error processing image. Please try again.");
        } finally {
          setUploadingImage(false);
          event.target.value = "";
        }
      };
      reader.onerror = () => {
        alert("Error reading image file.");
        setUploadingImage(false);
        event.target.value = "";
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error handling image:", error);
      alert("Error handling image. Please try again.");
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleContextMenu = (event, element) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      elementId: element.id,
    });
    setSelectedId(element.id);
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, elementId: null });
  };

  const handleContextMenuAction = (action) => {
    const element = design.elements.find(
      (el) => el.id === contextMenu.elementId,
    );
    if (!element) return;

    switch (action) {
      case "duplicate":
        addElement(element.type, {
          ...element,
          id: makeId(),
          x: element.x + 24,
          y: element.y + 24,
        });
        break;
      case "delete":
        emitChange({
          ...design,
          elements: design.elements.filter((el) => el.id !== element.id),
        });
        if (selectedId === element.id) setSelectedId(null);
        break;
      case "bringToFront":
        const maxZ = Math.max(...design.elements.map((el) => el.zIndex || 1));
        updateElement(element.id, { zIndex: maxZ + 1 });
        break;
      case "sendToBack":
        const minZ = Math.min(...design.elements.map((el) => el.zIndex || 1));
        updateElement(element.id, { zIndex: minZ - 1 });
        break;
      default:
        break;
    }
    closeContextMenu();
  };

  useEffect(() => {
    const handleClickOutside = () => closeContextMenu();
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const renderResizeHandles = (element) => {
    if (selectedId !== element.id || readOnly) return null;

    const handleStyle = {
      position: "absolute",
      background: "#fff",
      border: "2px solid #3b82f6",
      width: "10px",
      height: "10px",
      borderRadius: "50%",
      zIndex: 1001,
      cursor: "pointer",
      pointerEvents: "auto",
    };

    return (
      <>
        <div
          className="resize-handle"
          style={{
            ...handleStyle,
            cursor: "nw-resize",
            top: "-5px",
            left: "-5px",
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            handleResizeStart(e, element, "nw");
          }}
        />
        <div
          className="resize-handle"
          style={{
            ...handleStyle,
            cursor: "ne-resize",
            top: "-5px",
            right: "-5px",
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            handleResizeStart(e, element, "ne");
          }}
        />
        <div
          className="resize-handle"
          style={{
            ...handleStyle,
            cursor: "sw-resize",
            bottom: "-5px",
            left: "-5px",
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            handleResizeStart(e, element, "sw");
          }}
        />
        <div
          className="resize-handle"
          style={{
            ...handleStyle,
            cursor: "se-resize",
            bottom: "-5px",
            right: "-5px",
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            handleResizeStart(e, element, "se");
          }}
        />
        <div
          className="resize-handle"
          style={{
            ...handleStyle,
            cursor: "n-resize",
            top: "-5px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            handleResizeStart(e, element, "n");
          }}
        />
        <div
          className="resize-handle"
          style={{
            ...handleStyle,
            cursor: "s-resize",
            bottom: "-5px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            handleResizeStart(e, element, "s");
          }}
        />
        <div
          className="resize-handle"
          style={{
            ...handleStyle,
            cursor: "w-resize",
            left: "-5px",
            top: "50%",
            transform: "translateY(-50%)",
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            handleResizeStart(e, element, "w");
          }}
        />
        <div
          className="resize-handle"
          style={{
            ...handleStyle,
            cursor: "e-resize",
            right: "-5px",
            top: "50%",
            transform: "translateY(-50%)",
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            handleResizeStart(e, element, "e");
          }}
        />
      </>
    );
  };

  const renderElement = (element) => {
    const style = {
      left: `${(element.x / canvasSize.width) * 100}%`,
      top: `${(element.y / canvasSize.height) * 100}%`,
      width: `${(element.width / canvasSize.width) * 100}%`,
      height: `${(element.height / canvasSize.height) * 100}%`,
      color: element.color,
      backgroundColor: element.backgroundColor,
      fontSize: `${element.fontSize}px`,
      fontFamily: element.fontFamily,
      borderRadius: `${element.borderRadius || 0}px`,
      transform: `rotate(${element.rotation || 0}deg)`,
      zIndex: element.zIndex || 1,
      cursor: "move",
      position: "absolute",
      boxSizing: "border-box",
    };

    return (
      <div
        key={element.id}
        className={`designer-element designer-${element.type} ${selectedId === element.id ? "is-selected" : ""}`}
        style={style}
        onPointerDown={(event) => handlePointerDown(event, element)}
        onClick={(event) => event.stopPropagation()}
        onContextMenu={(event) => handleContextMenu(event, element)}
      >
        {element.type === "image" && element.src && (
          <img
            src={element.src}
            alt="Uploaded"
            draggable="false"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              pointerEvents: "none",
              userSelect: "none",
            }}
          />
        )}
        {(element.type === "text" || element.type === "sticker") && (
          <div
            dangerouslySetInnerHTML={{ __html: element.text }}
            style={{
              pointerEvents: "none",
              userSelect: "none",
              width: "100%",
              height: "100%",
              overflow: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        )}
        {element.type === "shape" && (
          <span style={{ opacity: 0, pointerEvents: "none" }}>shape</span>
        )}
        {renderResizeHandles(element)}
      </div>
    );
  };

  return (
    <div className={`card-designer ${readOnly ? "is-readonly" : ""}`}>
      {!readOnly && (
        <aside className="designer-panel designer-tools">
          <h2>Chi tiết</h2>
          <button type="button" onClick={() => addElement("text")}>
            <Type size={16} /> Thêm chữ
          </button>
          <button type="button" onClick={() => addElement("shape")}>
            <Square size={16} /> Thêm khối màu
          </button>
          <label className="designer-upload">
            {uploadingImage ? (
              <>📤 Đang xử lý ảnh...</>
            ) : (
              <>
                <ImageIcon size={16} /> Thêm ảnh
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImage}
              disabled={uploadingImage}
            />
          </label>

          <div className="designer-stickers">
            <div className="stickers-grid">
              {stickers.map((sticker) => (
                <button
                  key={sticker}
                  type="button"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData(
                      "application/json",
                      JSON.stringify({ type: "sticker", text: sticker }),
                    );
                  }}
                  onClick={() => addElement("sticker", { text: sticker })}
                >
                  {sticker}
                </button>
              ))}
            </div>
          </div>

          <p className="designer-hint">
            💡 Kéo sticker vào thiệp hoặc bấm để thêm nhanh.
          </p>
        </aside>
      )}

      <section className="designer-stage-wrap">
        <div
          ref={canvasRef}
          className="designer-stage"
          style={{ backgroundColor: design.backgroundColor }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onClick={() => !readOnly && setSelectedId(null)}
        >
          {[...design.elements]
            .sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1))
            .map(renderElement)}
        </div>
      </section>

      {!readOnly && (
        <aside className="designer-panel designer-properties">
          <h2>Tùy chỉnh</h2>

          <label>
            <Palette size={14} /> Màu nền thiệp
            <input
              type="color"
              value={design.backgroundColor}
              onChange={(event) =>
                emitChange({ ...design, backgroundColor: event.target.value })
              }
            />
          </label>

          {!selectedElement && <p>🔍 Chọn một chi tiết trên thiệp để chỉnh.</p>}

          {selectedElement && (
            <>
              {(selectedElement.type === "text" ||
                selectedElement.type === "sticker") && (
                <div
                  className="ckeditor-wrapper"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <label>✏️ Nội dung</label>
                  <div onClick={(e) => e.stopPropagation()}>
                    <CKEditor
                      editor={ClassicEditor}
                      data={selectedElement.text || ""}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        updateElement(selectedElement.id, { text: data });
                      }}
                      config={ckEditorConfig}
                      disabled={readOnly}
                    />
                  </div>
                </div>
              )}

              <label>
                🎨 Màu chữ
                <input
                  type="color"
                  value={selectedElement.color || "#243042"}
                  onChange={(event) =>
                    updateElement(selectedElement.id, {
                      color: event.target.value,
                    })
                  }
                />
              </label>

              {selectedElement.type === "shape" && (
                <label>
                  🟦 Màu khối
                  <input
                    type="color"
                    value={selectedElement.backgroundColor || "#ffd166"}
                    onChange={(event) =>
                      updateElement(selectedElement.id, {
                        backgroundColor: event.target.value,
                      })
                    }
                  />
                </label>
              )}

              <label>
                📏 Cỡ chữ ({selectedElement.fontSize || 28}px)
                <input
                  type="range"
                  min="12"
                  max="96"
                  value={selectedElement.fontSize || 28}
                  onChange={(event) =>
                    updateElement(selectedElement.id, {
                      fontSize: Number(event.target.value),
                    })
                  }
                />
              </label>

              <label>
                🔤 Font
                <select
                  value={selectedElement.fontFamily || "Arial"}
                  onChange={(event) =>
                    updateElement(selectedElement.id, {
                      fontFamily: event.target.value,
                    })
                  }
                >
                  {defaultFonts.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </label>

              <div className="designer-grid-controls">
                <label>
                  📐 Rộng
                  <input
                    type="number"
                    min="30"
                    max="900"
                    value={selectedElement.width}
                    onChange={(event) =>
                      updateElement(selectedElement.id, {
                        width: Number(event.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  📏 Cao
                  <input
                    type="number"
                    min="30"
                    max="540"
                    value={selectedElement.height}
                    onChange={(event) =>
                      updateElement(selectedElement.id, {
                        height: Number(event.target.value),
                      })
                    }
                  />
                </label>
              </div>

              <label>
                <RotateCw size={14} /> Xoay ({selectedElement.rotation || 0}°)
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={selectedElement.rotation || 0}
                  onChange={(event) =>
                    updateElement(selectedElement.id, {
                      rotation: Number(event.target.value),
                    })
                  }
                />
              </label>

              <div className="designer-actions-small">
                <button type="button" onClick={() => moveLayer(1)}>
                  ⬆️ Đưa lên
                </button>
                <button type="button" onClick={() => moveLayer(-1)}>
                  ⬇️ Đưa xuống
                </button>
                <button type="button" onClick={duplicateSelected}>
                  <Copy size={14} /> Nhân bản
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={deleteSelected}
                >
                  <Trash2 size={14} /> Xóa
                </button>
              </div>
            </>
          )}
        </aside>
      )}

      {/* Context Menu */}
      {contextMenu.visible && !readOnly && (
        <div
          className="context-menu"
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 10000,
          }}
        >
          <button onClick={() => handleContextMenuAction("duplicate")}>
            <Copy size={14} /> Nhân bản
          </button>
          <button onClick={() => handleContextMenuAction("delete")}>
            <Trash2 size={14} /> Xóa
          </button>
          <hr />
          <button onClick={() => handleContextMenuAction("bringToFront")}>
            <BringToFront size={14} /> Đưa lên đầu
          </button>
          <button onClick={() => handleContextMenuAction("sendToBack")}>
            <SendToBack size={14} /> Đưa xuống cuối
          </button>
        </div>
      )}
    </div>
  );
}

export default CardDesigner;
