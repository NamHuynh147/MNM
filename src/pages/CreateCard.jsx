import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CardDesigner from '../components/CardDesigner'
import * as api from '../services/api'
import '../styles/CreateCard.css'

function CreateCard() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    template_id: '',
    title: '',
    description: '',
  })
  const [designData, setDesignData] = useState({
    backgroundColor: '#fff7ed',
    elements: [],
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const data = await api.getTemplates()
      setTemplates(data)
      setError(null)
    } catch (err) {
      setError('Không thể lấy danh sách mẫu')
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
    if (!formData.title || !formData.template_id) {
      setError('Vui lòng điền tiêu đề và chọn mẫu')
      return
    }

    try {
      setSaving(true)
      const result = await api.createCard({
        template_id: parseInt(formData.template_id),
        user_id: 1,
        title: formData.title,
        description: formData.description,
        design_data: {
          ...designData,
          title: formData.title,
          description: formData.description,
        },
      })
      navigate(`/cards/${result.card_id}`)
    } catch (err) {
      setError('Lỗi tạo thiệp')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className='container'><p>Đang tải...</p></div>
  }

  return (
    <div className='container'>
      <div className='designer-page-header'>
        <div>
          <h1>Tạo thiệp mới</h1>
          <p>Kéo chữ, ảnh, sticker và khối màu để tự thiết kế bố cục thiệp.</p>
        </div>
      </div>

      {error && <p className='error'>{error}</p>}

      <form onSubmit={handleSubmit} className='create-card-form designer-form'>
        <div className='designer-meta'>
          <div className='form-group'>
            <label htmlFor='template_id'>Chọn mẫu thiệp *</label>
            <select
              id='template_id'
              name='template_id'
              value={formData.template_id}
              onChange={handleChange}
              required
            >
              <option value=''>-- Chọn mẫu --</option>
              {templates.map(template => (
                <option key={template.template_id} value={template.template_id}>
                  {template.name} ({template.category})
                </option>
              ))}
            </select>
          </div>

          <div className='form-group'>
            <label htmlFor='title'>Tiêu đề thiệp *</label>
            <input
              type='text'
              id='title'
              name='title'
              value={formData.title}
              onChange={handleChange}
              placeholder='Ví dụ: Lời mời dự tiệc cưới'
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
              placeholder='Nhập mô tả hoặc lời nhắn chính'
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
            {saving ? 'Đang tạo...' : 'Tạo thiệp'}
          </button>
          <button type='button' className='btn-secondary' onClick={() => navigate('/cards')}>
            Hủy
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateCard
