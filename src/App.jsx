import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Login from './pages/Login'
import ProgramKerja from './pages/ProgramKerja'
import Anggaran from './pages/Anggaran'
import DataRuangan from './RumahTangga/DataRuangan'
import BookingRuangan from './RumahTangga/BookingRuangan'
import KalenderRuangan from './RumahTangga/KalenderRuangan'
import KerusakanRuangan from './RumahTangga/KerusakanRuangan'
import PerbaikanRuangan from './RumahTangga/PerbaikanRuangan'
import DataAbsensi from './Kepegawaian/DataAbsensi'
import Pelanggaran from './Kepegawaian/Pelanggaran'
import RekapAbsensi from './Kepegawaian/RekapAbsensi'


function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })


  const handleLogin = (u) => {
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
  }


  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }


  if (!user) return <Login onLogin={handleLogin} />


  return (
    <div className="layout">
      <Sidebar />
      <div className="main-area">
        <Header user={user} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/program-kerja" />} />
            <Route path="/program-kerja" element={<ProgramKerja user={user} />} />
            <Route path="/anggaran" element={<Anggaran user={user} />} />
            <Route path="/data-ruangan" element={<DataRuangan />} />
            <Route path="/booking-ruangan" element={<BookingRuangan />} />
            <Route path="/kalender-ruangan" element={<KalenderRuangan />} />
            <Route path="/kerusakan-ruangan" element={<KerusakanRuangan />} />
            <Route path="/perbaikan-ruangan" element={<PerbaikanRuangan />} />

            <Route path="/data-absensi" element={<DataAbsensi />} />
            <Route path="/pelanggaran" element={<Pelanggaran />} />
            <Route path="/rekap-absensi" element={<RekapAbsensi />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}


export default App