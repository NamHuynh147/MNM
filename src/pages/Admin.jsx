import React, { useEffect, useMemo, useState } from 'react'
import * as api from '../services/api'
import '../styles/Admin.css'

const emptyForm = {
  card_id: null,
  template_id: '',
  title: '',
  description: '',
  backgroundColor: '#fff7ed',
}

function Admin() {
  const [cards, setCards] = useState([])
  const [templates, setTemplates] = useState([])
  const [formData, setFormData] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      const [cardsData, templatesData] = await Promise.all([
        api.getCards(),
        api.getTemplates(),
      ])
      setCards(cardsData)
      setTemplates(templatesData)
      setError('')
    } catch (err) {
      setError('Không thể tải dữ liệu admin')
    } finally {
      setLoading(false)
    }
  }

  const filteredCards = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return cards

    return cards.filter(card => {
      const title = card.title?.toLowerCase() || ''
      const description = card.description?.toLowerCase() || ''
      const templateName = card.template_name?.toLowerCase() || ''
      return title.includes(keyword) || description.includes(keyword) || templateName.includes(keyword)
    })
  }, [cards, search])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData(emptyForm)
    setError('')
    setMessage('')
  }

  const handleEdit = (card) => {
    setFormData({
      card_id: card.card_id,
      template_id: card.template_id || '',
      title: card.title || '',
      description: card.description || '',
      backgroundColor: card.design_data?.backgroundColor || '#fff7ed',
    })
    setMessage('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề thiệp')
      return
    }

    const payload = {
      template_id: formData.template_id ? Number(formData.template_id) : null,
      user_id: 1,
      title: formData.title.trim(),
      description: formData.description.trim(),
      design_data: {
        backgroundColor: formData.backgroundColor,
        title: formData.title.trim(),
        description: formData.description.trim(),
        elements: [],
      },
    }

    try {
      setSaving(true)
      if (formData.card_id) {
        const updatedCard = await api.updateCard(formData.card_id, payload)
        setCards(prev => prev.map(card => (
          card.card_id === updatedCard.card_id
            ? { ...card, ...updatedCard, template_name: getTemplateName(updatedCard.template_id) }
            : card
        )))
        setMessage('Đã cập nhật thiệp')
      } else {
        const newCard = await api.createCard(payload)
        setCards(prev => [{ ...newCard, template_name: getTemplateName(newCard.template_id) }, ...prev])
        setMessage('Đã tạo thiệp mới')
      }
      setFormData(emptyForm)
    } catch (err) {
      setError(err.message || 'Lưu thiệp thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (card) => {
    const confirmed = window.confirm(`Xóa thiệp "${card.title}"?`)
    if (!confirmed) return

    try {
      await api.deleteCard(card.card_id)
      setCards(prev => prev.filter(item => item.card_id !== card.card_id))
      if (formData.card_id === card.card_id) setFormData(emptyForm)
      setMessage('Đã xóa thiệp')
      setError('')
    } catch (err) {
      setError('Xóa thiệp thất bại')
    }
  }

  const getTemplateName = (templateId) => {
    const template = templates.find(item => item.template_id === Number(templateId))
    return template?.name || 'Không có mẫu'
  }

  if (loading) {
    return (
      <div className='admin-page'>
        <div className='admin-shell'>Đang tải dữ liệu...</div>
      </div>
    )
  }

  return (
    <div className='admin-page'>
      <div className='admin-shell'>
        <section className='admin-hero'>
          <div>
            <p className='admin-kicker'>Admin</p>
            <h1>Quản lý thiệp mời</h1>
            <p>Tạo, sửa, xóa và kiểm tra nhanh các thiệp đang có trong hệ thống.</p>
          </div>
          <div className='admin-stats'>
            <span>{cards.length}</span>
            <small>Tổng thiệp</small>
          </div>
        </section>

        {error && <p className='error'>{error}</p>}
        {message && <p className='success'>{message}</p>}

        <section className='admin-layout'>
          <form className='admin-form' onSubmit={handleSubmit}>
            <div className='admin-section-title'>
              <h2>{formData.card_id ? 'Sửa thiệp' : 'Tạo thiệp'}</h2>
              {formData.card_id && (
                <button type='button' className='admin-link-button' onClick={resetForm}>
                  Tạo mới
                </button>
              )}
            </div>

            <div className='form-group'>
              <label htmlFor='title'>Tiêu đề</label>
              <input
                id='title'
                name='title'
                value={formData.title}
                onChange={handleChange}
                placeholder='Ví dụ: Mời dự tiệc sinh nhật'
                required
              />
            </div>

            <div className='form-group'>
              <label htmlFor='template_id'>Mẫu thiệp</label>
              <select
                id='template_id'
                name='template_id'
                value={formData.template_id}
                onChange={handleChange}
              >
                <option value=''>Không chọn mẫu</option>
                {templates.map(template => (
                  <option key={template.template_id} value={template.template_id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div className='form-group'>
              <label htmlFor='description'>Mô tả</label>
              <textarea
                id='description'
                name='description'
                value={formData.description}
                onChange={handleChange}
                placeholder='Nội dung ngắn hiển thị trên thiệp'
                rows='4'
              />
            </div>

            <div className='form-group'>
              <label htmlFor='backgroundColor'>Màu nền</label>
              <div className='admin-color-row'>
                <input
                  id='backgroundColor'
                  name='backgroundColor'
                  type='color'
                  value={formData.backgroundColor}
                  onChange={handleChange}
                />
                <span>{formData.backgroundColor}</span>
              </div>
            </div>

            <button type='submit' className='btn-primary admin-submit' disabled={saving}>
              {saving ? 'Đang lưu...' : formData.card_id ? 'Cập nhật' : 'Tạo thiệp'}
            </button>
          </form>

          <section className='admin-list-panel'>
            <div className='admin-list-header'>
              <div>
                <h2>Danh sách thiệp</h2>
                <p>{filteredCards.length} kết quả</p>
              </div>
              <input
                className='admin-search'
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder='Tìm thiệp...'
              />
            </div>

            <div className='admin-table'>
              {filteredCards.length === 0 ? (
                <div className='admin-empty'>Chưa có thiệp phù hợp.</div>
              ) : (
                filteredCards.map(card => (
                  <article className='admin-row' key={card.card_id}>
                    <div className='admin-card-preview' style={{ backgroundColor: card.design_data?.backgroundColor || '#fff7ed' }}>
                      <span>{card.title?.charAt(0)?.toUpperCase() || 'T'}</span>
                    </div>
                    <div className='admin-card-main'>
                      <h3>{card.title}</h3>
                      <p>{card.description || 'Chưa có mô tả'}</p>
                      <small>{card.template_name || 'Không có mẫu'}</small>
                    </div>
                    <div className='admin-row-actions'>
                      <button type='button' className='btn-secondary' onClick={() => handleEdit(card)}>
                        Sửa
                      </button>
                      <button type='button' className='btn-danger' onClick={() => handleDelete(card)}>
                        Xóa
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </section>
      </div>
    </div>
  )
}

export default Admin
