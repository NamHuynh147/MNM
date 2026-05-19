import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CardDesigner from '../components/CardDesigner'
import * as api from '../services/api'
import '../styles/EditCard.css'

function EditCard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [card, setCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  })
  const [designData, setDesignData] = useState({
    backgroundColor: '#fff7ed',
    elements: [],
  })

  useEffect(() => {
    fetchCard()
  }, [id])

  const fetchCard = async () => {
    try {
      const data = await api.getCardById(id)
      setCard(data)
      setFormData({
        title: data.title,
        description: data.description || '',
      })
      setDesignData(data.design_data || { backgroundColor: '#fff7ed', elements: [] })
      setError(null)
    } catch (err) {
      setError('Không thể lấy thông tin thiệp')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!formData.title) {
      setError('Vui lòng điền tiêu đề')
      return
    }

    try {
      setSaving(true)
      await api.updateCard(id, {
        title: formData.title,
        description: formData.description,
        design_data: {
          ...designData,
          title: formData.title,
          description: formData.description,
        },
      })
      navigate(`/cards/${id}`)
    } catch (err) {
      setError('Lỗi cập nhật thiệp')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading && !card) {
    return <div className='container'><p>Đang tải...</p></div>
  }

  return (
    <div className='container'>
      <div className='designer-page-header'>
        <div>
          <h1>Chỉnh sửa thiệp</h1>
          <p>Chọn một chi tiết trên thiệp để kéo, đổi chữ, đổi màu hoặc chỉnh lớp.</p>
        </div>
      </div>

      {error && <p className='error'>{error}</p>}

      <form onSubmit={handleSubmit} className='edit-card-form designer-form'>
        <div className='designer-meta'>
          <div className='form-group'>
            <label htmlFor='title'>Tiêu đề thiệp *</label>
            <input
              type='text'
              id='title'
              name='title'
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor='description'>Mô tả</label>
            <textarea
              id='description'
              name='description'
              value={formData.description}
              onChange={handleChange}
              rows='3'
            />
          </div>
        </div>

        <CardDesigner
          value={designData}
          title={formData.title}
          description={formData.description}
          onChange={setDesignData}
        />

        <div className='form-actions'>
          <button type='submit' className='btn-primary' disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
          <button type='button' className='btn-secondary' onClick={() => navigate(`/cards/${id}`)}>
            Hủy
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditCard
