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
import DataPegawai from './Kepegawaian/DataPegawai'
import Pelanggaran from './Kepegawaian/Pelanggaran'

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

  // ===== 🔐 LOGIKA ROLE (RBAC) =====
  const isSuperAdmin = user.role === 'superadmin'
  const isPegawaiBiasa = user.role === 'pegawai'
  const isGuest = user.role === 'guest'

  const isAdminKeuangan = user.role === 'admin_keuangan' || isSuperAdmin
  const isAdminKepegawaian = user.role === 'admin_kepegawaian' || isSuperAdmin

  const halamanAwal = () => {
    if (isAdminKepegawaian && !isSuperAdmin) return '/data-absensi'
    if (user.role === 'admin_keuangan') return '/program-kerja'
    if (user.role === 'admin_rumahtangga') return '/data-ruangan'
    if (isPegawaiBiasa) return '/pelanggaran'
    return '/program-kerja'
  }

  return (
    <div className="layout">
      <Sidebar user={user} />
      <div className="main-area">
        <Header user={user} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to={halamanAwal()} />} />

            {/* 💰 KEUANGAN */}
            <Route path="/program-kerja" element={isAdminKeuangan || isGuest ? <ProgramKerja user={user} /> : <Navigate to="/" />} />
            <Route path="/anggaran" element={isAdminKeuangan || isGuest ? <Anggaran user={user} /> : <Navigate to="/" />} />

            {/* 🏠 RUMAH TANGGA */}
            <Route path="/data-ruangan" element={<DataRuangan />} />
            <Route path="/booking-ruangan" element={<BookingRuangan />} />
            <Route path="/kalender-ruangan" element={<KalenderRuangan />} />
            <Route path="/kerusakan-ruangan" element={<KerusakanRuangan />} />
            <Route path="/perbaikan-ruangan" element={<PerbaikanRuangan />} />

            {/* 👔 KEPEGAWAIAN (RBAC Alya + Data Pegawai dari Delita) */}
            <Route path="/data-pegawai" element={isAdminKepegawaian ? <DataPegawai user={user} /> : <Navigate to="/" />} />
            <Route path="/data-absensi" element={isAdminKepegawaian ? <DataAbsensi /> : <Navigate to="/" />} />
            <Route path="/pelanggaran" element={isAdminKepegawaian || isPegawaiBiasa ? <Pelanggaran user={user} /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App