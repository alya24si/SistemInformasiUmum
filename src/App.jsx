import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import NotifikasiRumahTangga from './components/NotifikasiRumahTangga'
import NotifikasiKGB from './components/NotifikasiKGB'
import Login from './pages/Login'
import ProgramKerja from './pages/ProgramKerja'
import Anggaran from './pages/Anggaran'
import DataRuangan from './RumahTangga/DataRuangan'
import BookingRuangan from './RumahTangga/BookingRuangan'
import KalenderRuangan from './RumahTangga/KalenderRuangan'
import Kerusakan from './RumahTangga/Kerusakan'
import Perbaikan from './RumahTangga/Perbaikan'
import DataAbsensi from './Kepegawaian/DataAbsensi'
import DataPegawai from './Kepegawaian/DataPegawai'
import Pelanggaran from './Kepegawaian/Pelanggaran'
import KangCepot from './pages/KangCepot'

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

  const isSuperAdmin = user.role === 'superadmin'
  const isPegawaiBiasa = user.role === 'pegawai'
  const isGuest = user.role === 'guest'

  const isAdminKeuangan = user.role === 'admin_keuangan' || isSuperAdmin
  const isAdminKepegawaian = user.role === 'admin_kepegawaian' || isSuperAdmin
  // ✨ BARU: sebelumnya belum didefinisikan di sini (cuma ada di Sidebar.jsx).
  // Dibutuhkan sekarang buat nyamain guard rute Keuangan & Kepegawaian di
  // bawah dengan logic bolehKeuangan/bolehDataPegawai/dst di Sidebar.jsx.
  const isAdminRT = user.role === 'admin_rumahtangga' || isSuperAdmin

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

            {/* ✨ UBAH: nambah isAdminKepegawaian & isAdminRT, nyamain sama
                bolehKeuangan di Sidebar.jsx. Admin Keuangan & guest TIDAK
                disentuh -- kondisi lama mereka tetap persis sama. */}
            <Route path="/program-kerja" element={isAdminKeuangan || isGuest || isAdminKepegawaian || isAdminRT ? <ProgramKerja user={user} /> : <Navigate to="/" />} />
            <Route path="/anggaran" element={isAdminKeuangan || isGuest || isAdminKepegawaian || isAdminRT ? <Anggaran user={user} /> : <Navigate to="/" />} />

            {/* 🏠 RUMAH TANGGA */}
            <Route path="/data-ruangan" element={<DataRuangan user={user} />} />
            <Route path="/booking-ruangan" element={<BookingRuangan user={user} />} />
            <Route path="/kalender-ruangan" element={<KalenderRuangan user={user} />} />

            {/* Kerusakan & Perbaikan sekarang 1 halaman per fitur, pilihan
                Ruangan/Mobil ada di dalam sebagai tab (lihat Kerusakan.jsx
                & Perbaikan.jsx) */}
            <Route path="/kerusakan" element={<Kerusakan user={user} />} />
            <Route path="/perbaikan" element={<Perbaikan user={user} />} />

            {/* Redirect rute lama biar link/bookmark lama gak 404 */}
            <Route path="/kerusakan-ruangan" element={<Navigate to="/kerusakan" replace />} />
            <Route path="/kerusakan-mobil" element={<Navigate to="/kerusakan" replace />} />
            <Route path="/perbaikan-ruangan" element={<Navigate to="/perbaikan" replace />} />
            <Route path="/perbaikan-mobil" element={<Navigate to="/perbaikan" replace />} />

            {/* ✨ UBAH: nambah isAdminRT, nyamain sama bolehDataPegawai/
                bolehDataAbsensi/bolehPelanggaran di Sidebar.jsx. */}
            <Route path="/data-pegawai" element={isAdminKepegawaian || isAdminRT ? <DataPegawai user={user} /> : <Navigate to="/" />} />
            <Route path="/data-absensi" element={isAdminKepegawaian || isPegawaiBiasa || isAdminRT ? <DataAbsensi user={user} /> : <Navigate to="/" />} />
            <Route path="/pelanggaran" element={isAdminKepegawaian || isPegawaiBiasa || isAdminRT ? <Pelanggaran user={user} /> : <Navigate to="/" />} />

            {/* 🟢 KANG CEPOT — hanya Admin Keuangan & Superadmin */}
            <Route path="/kang-cepot" element={(isAdminKeuangan || isPegawaiBiasa) ? <KangCepot user={user} /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>

      {/* 🔔 Notifikasi Rumah Tangga -- widget mengambang, cuma tampil buat
          Admin Rumah Tangga / Superadmin */}
      <NotifikasiRumahTangga user={user} />

      <NotifikasiKGB user={user} />
    </div>
  )
}

export default App