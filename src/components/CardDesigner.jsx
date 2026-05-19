import React, { useEffect, useMemo, useRef, useState } from 'react'
import '../styles/CardDesigner.css'

const canvasSize = { width: 900, height: 540 }

const defaultFonts = ['Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Courier New']
const stickers = ['★', '♥', '✦', '✿', '❀', '✓']

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

const createElement = (type, overrides = {}) => {
  const base = {
    id: makeId(),
    type,
    x: 120,
    y: 120,
    width: type === 'text' ? 260 : 110,
    height: type === 'text' ? 70 : 110,
    rotation: 0,
    color: '#243042',
    backgroundColor: type === 'shape' ? '#ffd166' : 'transparent',
    fontSize: type === 'sticker' ? 48 : 28,
    fontFamily: 'Arial',
    text: type === 'text' ? 'Nhập chữ' : type === 'sticker' ? '★' : '',
    borderRadius: type === 'shape' ? 18 : 0,
    zIndex: 1,
  }

  return { ...base, ...overrides }
}

const normalizeDesign = (design, title = '', description = '') => {
  if (design?.elements?.length) {
    return {
      backgroundColor: design.backgroundColor || '#fff7ed',
      elements: design.elements,
    }
  }

  return {
    backgroundColor: design?.backgroundColor || '#fff7ed',
    elements: [
      createElement('text', {
        id: 'title-layer',
        text: title || 'Tiêu đề thiệp',
        x: 90,
        y: 110,
        width: 720,
        height: 90,
        fontSize: Number(design?.fontSize) || 42,
        fontFamily: design?.fontFamily || 'Georgia',
        color: design?.textColor || '#7c2d12',
        zIndex: 1,
      }),
      createElement('text', {
        id: 'message-layer',
        text: description || 'Kéo thả chữ, hình, sticker để tự thiết kế thiệp.',
        x: 150,
        y: 250,
        width: 600,
        height: 90,
        fontSize: 24,
        fontFamily: design?.fontFamily || 'Arial',
        color: design?.textColor || '#374151',
        zIndex: 2,
      }),
    ],
  }
}

function CardDesigner({ value, title, description, onChange, readOnly = false }) {
  const canvasRef = useRef(null)
  const dragRef = useRef(null)
  const [selectedId, setSelectedId] = useState(null)

  const design = useMemo(
    () => normalizeDesign(value, title, description),
    [value, title, description]
  )

  const selectedElement = design.elements.find(element => element.id === selectedId)

  const emitChange = (nextDesign) => {
    onChange?.({
      ...nextDesign,
      backgroundColor: nextDesign.backgroundColor || '#fff7ed',
      canvas: canvasSize,
    })
  }

  useEffect(() => {
    if (!readOnly && !value?.elements?.length) {
      emitChange(design)
    }
  }, [readOnly, value?.elements?.length])

  const updateElement = (id, updates) => {
    emitChange({
      ...design,
      elements: design.elements.map(element =>
        element.id === id ? { ...element, ...updates } : element
      ),
    })
  }

  const addElement = (type, overrides = {}) => {
    const maxZ = Math.max(0, ...design.elements.map(element => element.zIndex || 0))
    const nextElement = createElement(type, { ...overrides, zIndex: maxZ + 1 })
    emitChange({ ...design, elements: [...design.elements, nextElement] })
    setSelectedId(nextElement.id)
  }

  const deleteSelected = () => {
    if (!selectedElement) return
    emitChange({
      ...design,
      elements: design.elements.filter(element => element.id !== selectedElement.id),
    })
    setSelectedId(null)
  }

  const duplicateSelected = () => {
    if (!selectedElement) return
    addElement(selectedElement.type, {
      ...selectedElement,
      id: makeId(),
      x: selectedElement.x + 24,
      y: selectedElement.y + 24,
    })
  }

  const moveLayer = (direction) => {
    if (!selectedElement) return
    updateElement(selectedElement.id, {
      zIndex: clamp((selectedElement.zIndex || 1) + direction, 1, 99),
    })
  }

  const getCanvasPoint = (event) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = canvasSize.width / rect.width
    const scaleY = canvasSize.height / rect.height

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    }
  }

  const handlePointerDown = (event, element) => {
    if (readOnly) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    const point = getCanvasPoint(event)
    dragRef.current = {
      id: element.id,
      offsetX: point.x - element.x,
      offsetY: point.y - element.y,
    }
    setSelectedId(element.id)
  }

  const handlePointerMove = (event) => {
    if (!dragRef.current || readOnly) return
    const point = getCanvasPoint(event)
    const element = design.elements.find(item => item.id === dragRef.current.id)
    if (!element) return

    updateElement(element.id, {
      x: clamp(point.x - dragRef.current.offsetX, 0, canvasSize.width - element.width),
      y: clamp(point.y - dragRef.current.offsetY, 0, canvasSize.height - element.height),
    })
  }

  const handlePointerUp = () => {
    dragRef.current = null
  }

  const handleDrop = (event) => {
    if (readOnly) return
    event.preventDefault()
    const payload = JSON.parse(event.dataTransfer.getData('application/json') || '{}')
    if (!payload.type) return

    const point = getCanvasPoint(event)
    addElement(payload.type, {
      text: payload.text,
      x: clamp(point.x - 55, 0, canvasSize.width - 110),
      y: clamp(point.y - 55, 0, canvasSize.height - 110),
    })
  }

  const handleImage = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      addElement('image', {
        src: reader.result,
        x: 160,
        y: 130,
        width: 220,
        height: 150,
      })
      event.target.value = ''
    }
    reader.readAsDataURL(file)
  }

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
    }

    return (
      <div
        key={element.id}
        className={`designer-element designer-${element.type} ${selectedId === element.id ? 'is-selected' : ''}`}
        style={style}
        onPointerDown={(event) => handlePointerDown(event, element)}
        onClick={(event) => event.stopPropagation()}
      >
        {element.type === 'image' && <img src={element.src} alt='' draggable='false' />}
        {(element.type === 'text' || element.type === 'sticker') && (
          <span>{element.text}</span>
        )}
      </div>
    )
  }

  return (
    <div className={`card-designer ${readOnly ? 'is-readonly' : ''}`}>
      {!readOnly && (
        <aside className='designer-panel designer-tools'>
          <h2>Chi tiết</h2>
          <button type='button' onClick={() => addElement('text')}>Thêm chữ</button>
          <button type='button' onClick={() => addElement('shape')}>Thêm khối màu</button>
          <label className='designer-upload'>
            Thêm ảnh
            <input type='file' accept='image/*' onChange={handleImage} />
          </label>

          <div className='designer-stickers'>
            {stickers.map(sticker => (
              <button
                key={sticker}
                type='button'
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData('application/json', JSON.stringify({ type: 'sticker', text: sticker }))
                }}
                onClick={() => addElement('sticker', { text: sticker })}
              >
                {sticker}
              </button>
            ))}
          </div>

          <p>Kéo sticker vào thiệp hoặc bấm để thêm nhanh.</p>
        </aside>
      )}

      <section className='designer-stage-wrap'>
        <div
          ref={canvasRef}
          className='designer-stage'
          style={{ backgroundColor: design.backgroundColor }}
          onDragOver={(event) => event.preventDefault()}
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
        <aside className='designer-panel designer-properties'>
          <h2>Tùy chỉnh</h2>

          <label>
            Màu nền thiệp
            <input
              type='color'
              value={design.backgroundColor}
              onChange={(event) => emitChange({ ...design, backgroundColor: event.target.value })}
            />
          </label>

          {!selectedElement && <p>Chọn một chi tiết trên thiệp để chỉnh.</p>}

          {selectedElement && (
            <>
              {(selectedElement.type === 'text' || selectedElement.type === 'sticker') && (
                <label>
                  Nội dung
                  <textarea
                    value={selectedElement.text}
                    onChange={(event) => updateElement(selectedElement.id, { text: event.target.value })}
                    rows='3'
                  />
                </label>
              )}

              <label>
                Màu chữ
                <input
                  type='color'
                  value={selectedElement.color || '#243042'}
                  onChange={(event) => updateElement(selectedElement.id, { color: event.target.value })}
                />
              </label>

              {selectedElement.type === 'shape' && (
                <label>
                  Màu khối
                  <input
                    type='color'
                    value={selectedElement.backgroundColor || '#ffd166'}
                    onChange={(event) => updateElement(selectedElement.id, { backgroundColor: event.target.value })}
                  />
                </label>
              )}

              <label>
                Cỡ chữ
                <input
                  type='range'
                  min='12'
                  max='96'
                  value={selectedElement.fontSize || 28}
                  onChange={(event) => updateElement(selectedElement.id, { fontSize: Number(event.target.value) })}
                />
              </label>

              <label>
                Font
                <select
                  value={selectedElement.fontFamily || 'Arial'}
                  onChange={(event) => updateElement(selectedElement.id, { fontFamily: event.target.value })}
                >
                  {defaultFonts.map(font => <option key={font} value={font}>{font}</option>)}
                </select>
              </label>

              <div className='designer-grid-controls'>
                <label>
                  Rộng
                  <input
                    type='number'
                    min='30'
                    max='900'
                    value={selectedElement.width}
                    onChange={(event) => updateElement(selectedElement.id, { width: Number(event.target.value) })}
                  />
                </label>
                <label>
                  Cao
                  <input
                    type='number'
                    min='30'
                    max='540'
                    value={selectedElement.height}
                    onChange={(event) => updateElement(selectedElement.id, { height: Number(event.target.value) })}
                  />
                </label>
              </div>

              <label>
                Xoay
                <input
                  type='range'
                  min='-45'
                  max='45'
                  value={selectedElement.rotation || 0}
                  onChange={(event) => updateElement(selectedElement.id, { rotation: Number(event.target.value) })}
                />
              </label>

              <div className='designer-actions-small'>
                <button type='button' onClick={() => moveLayer(1)}>Đưa lên</button>
                <button type='button' onClick={() => moveLayer(-1)}>Đưa xuống</button>
                <button type='button' onClick={duplicateSelected}>Nhân bản</button>
                <button type='button' className='danger' onClick={deleteSelected}>Xóa</button>
              </div>
            </>
          )}
        </aside>
      )}
    </div>
  )
}

export default CardDesigner
