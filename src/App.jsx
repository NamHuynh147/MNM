import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import CardList from './pages/CardList'
import CreateCard from './pages/CreateCard'
import DetailCard from './pages/DetailCard'
import EditCard from './pages/EditCard'
import './styles/App.css'

function App() {
  return (
    <div className='app'>
      <Navbar />
      <main className='app-main'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/cards' element={<CardList />} />
          <Route path='/cards/create' element={<CreateCard />} />
          <Route path='/cards/:id' element={<DetailCard />} />
          <Route path='/cards/:id/edit' element={<EditCard />} />
        </Routes>
      </main>
      <footer className='app-footer'>
        <p>&copy; 2024 Tạo Thiệp Mời. Tất cả quyền được bảo lưu.</p>
      </footer>
    </div>
  )
}

export default App