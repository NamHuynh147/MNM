import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../services/api'
import '../styles/CardList.css'

function CardList() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      setLoading(true)
      const data = await api.getCards()
      setCards(data)
      setError(null)
    } catch (err) {
      setError('Không thể lấy danh sách thiệp')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Bạn chắc chắn muốn xóa thiệp này?')) {
      try {
        await api.deleteCard(id)
        setCards(cards.filter(card => card.card_id !== id))
      } catch (err) {
        setError('Lỗi xóa thiệp')
      }
    }
  }

  if (loading) return <div className='container'><p>Đang tải...</p></div>
  if (error) return <div className='container'><p className='error'>{error}</p></div>

  return (
    <div className='container'>
      <div className='page-header'>
        <h1>Danh Sách Thiệp Của Tôi</h1>
        <Link to='/cards/create' className='btn-primary'>+ Tạo Thiệp Mới</Link>
      </div>

      {cards.length === 0 ? (
        <div className='empty-state'>
          <p>Chưa có thiệp nào. <Link to='/cards/create'>Tạo một thiệp ngay</Link></p>
        </div>
      ) : (
        <div className='cards-grid'>
          {cards.map(card => (
            <div key={card.card_id} className='card-item'>
              <div className='card-preview'>
                <h3>{card.title}</h3>
                <p className='template'>Mẫu: {card.template_name || 'N/A'}</p>
                <p className='description'>{card.description}</p>
              </div>
              <div className='card-actions'>
                <Link to={`/cards/${card.card_id}`} className='btn-secondary'>Xem</Link>
                <Link to={`/cards/${card.card_id}/edit`} className='btn-secondary'>Chỉnh Sửa</Link>
                <button onClick={() => handleDelete(card.card_id)} className='btn-danger'>Xóa</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CardList