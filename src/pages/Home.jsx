import React from 'react'
import { useNavigate } from 'react-router-dom'
import wedding from '../assets/images/wedding.jpg'
import birthday from '../assets/images/birthday.jpg'
import event from '../assets/images/event.jpg'
import '../styles/Home.css'

function Home() {
  const navigate = useNavigate()

  return (
    <main className='home-main'>
      <section className='hero'>
        <h1>Tạo thiệp mời đẹp trong vài phút</h1>
        <p>Chọn mẫu, chỉnh sửa dễ dàng, chia sẻ ngay lập tức.</p>
        <button className='btn-primary' onClick={() => navigate('/cards/create')}>Bắt đầu thiết kế</button>
      </section>

      <section className='showcase'>
        <h2>Mẫu thiệp nổi bật</h2>

        <div className='card-container'>
          <div className='card'>
            <img src={wedding} alt='Thiệp cưới' />
            <p>Thiệp cưới</p>
          </div>

          <div className='card'>
            <img src={birthday} alt='Thiệp sinh nhật' />
            <p>Thiệp sinh nhật</p>
          </div>

          <div className='card'>
            <img src={event} alt='Thiệp sự kiện' />
            <p>Thiệp sự kiện</p>
          </div>
        </div>
      </section>

      <section className='cta'>
        <h2>Thiết kế thiệp mời của riêng bạn</h2>
        <button className='btn-secondary' onClick={() => navigate('/cards')}>Khám phá thêm</button>
      </section>
    </main>
  )
}

export default Home