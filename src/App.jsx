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

  // ===== 🔐 LOGIKA ROLE =====
  const isSuperAdmin = user.role === 'superadmin'
  const isPegawaiBiasa = user.role === 'pegawai'
  const isGuest = user.role === 'guest'

  // Superadmin otomatis termasuk di semua admin modul
  const isAdminKeuangan = user.role === 'admin_keuangan' || isSuperAdmin
  const isAdminKepegawaian = user.role === 'admin_kepegawaian' || isSuperAdmin

  // Halaman awal sesuai role
  const halamanAwal = () => {
    if (isAdminKepegawaian && !isSuperAdmin) return '/data-absensi'
    if (user.role === 'admin_keuangan') return '/program-kerja'
    if (user.role === 'admin_rumahtangga') return '/data-ruangan'
    if (isPegawaiBiasa) return '/pelanggaran'
    return '/program-kerja' // superadmin & guest
  }

  return (
    <div className="layout">
      <Sidebar user={user} />
      <div className="main-area">
        <Header user={user} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to={halamanAwal()} />} />

            {/* 💰 KEUANGAN: hanya admin_keuangan, superadmin, guest */}
            <Route path="/program-kerja" element={isAdminKeuangan || isGuest ? <ProgramKerja user={user} /> : <Navigate to="/" />} />
            <Route path="/anggaran" element={isAdminKeuangan || isGuest ? <Anggaran user={user} /> : <Navigate to="/" />} />

            {/* 🏠 RUMAH TANGGA: semua yang login bisa akses (kebutuhan bersama) */}
            <Route path="/data-ruangan" element={<DataRuangan />} />
            <Route path="/booking-ruangan" element={<BookingRuangan />} />
            <Route path="/kalender-ruangan" element={<KalenderRuangan />} />
            <Route path="/kerusakan-ruangan" element={<KerusakanRuangan />} />
            <Route path="/perbaikan-ruangan" element={<PerbaikanRuangan />} />

            {/* 👔 KEPEGAWAIAN: hanya admin_kepegawaian, superadmin, dan pegawai (untuk pelanggaran pribadi) */}
            <Route path="/data-absensi" element={isAdminKepegawaian ? <DataAbsensi /> : <Navigate to="/" />} />
            <Route path="/pelanggaran" element={isAdminKepegawaian || isPegawaiBiasa ? <Pelanggaran user={user} /> : <Navigate to="/" />} />
            <Route path="/rekap-absensi" element={isAdminKepegawaian ? <RekapAbsensi /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App