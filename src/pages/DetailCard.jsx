import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CardDesigner from '../components/CardDesigner'
import * as api from '../services/api'
import '../styles/DetailCard.css'

function DetailCard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [card, setCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCard()
  }, [id])

  const fetchCard = async () => {
    try {
      setLoading(true)
      const data = await api.getCardById(id)
      setCard(data)
      setError(null)
    } catch (err) {
      setError('Không thể lấy thông tin thiệp')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Bạn chắc chắn muốn xóa thiệp này?')) return

    try {
      await api.deleteCard(id)
      navigate('/cards')
    } catch (err) {
      setError('Lỗi xóa thiệp')
      console.error(err)
    }
  }

  if (loading) return <div className='container'><p>Đang tải...</p></div>
  if (error) return <div className='container'><p className='error'>{error}</p></div>
  if (!card) return <div className='container'><p>Không tìm thấy thiệp</p></div>

  const designData = card.design_data || {}

  return (
    <div className='container'>
      <div className='detail-header'>
        <h1>{card.title}</h1>
        <Link to='/cards' className='btn-secondary'>Quay lại</Link>
      </div>

      <div className='detail-content'>
        <div className='card-preview-large'>
          <CardDesigner
            value={designData}
            title={card.title}
            description={card.description}
            readOnly
          />
        </div>

        <div className='card-info'>
          <h3>Thông tin chi tiết</h3>
          <div className='info-group'>
            <label>Tiêu đề:</label>
            <p>{card.title}</p>
          </div>

          {card.description && (
            <div className='info-group'>
              <label>Mô tả:</label>
              <p>{card.description}</p>
            </div>
          )}

          <div className='info-group'>
            <label>Mẫu thiệp:</label>
            <p>{card.template_name || 'Không xác định'}</p>
          </div>

          <div className='info-group'>
            <label>Cấu hình thiết kế:</label>
            <ul>
              <li>Màu nền: <span style={{ color: designData.backgroundColor }}>{designData.backgroundColor || '#fff7ed'}</span></li>
              <li>Số chi tiết: {designData.elements?.length || 2}</li>
              <li>Tạo lúc: {new Date(card.created_at).toLocaleString('vi-VN')}</li>
              {card.updated_at && <li>Cập nhật: {new Date(card.updated_at).toLocaleString('vi-VN')}</li>}
            </ul>
          </div>
        </div>
      </div>

      <div className='card-actions'>
        <button onClick={() => window.print()} className='btn-secondary'>In thiệp</button>
        <Link to={`/cards/${id}/edit`} className='btn-primary'>Chỉnh sửa</Link>
        <button onClick={handleDelete} className='btn-danger'>Xóa</button>
      </div>
    </div>
  )
}

export default DetailCard
