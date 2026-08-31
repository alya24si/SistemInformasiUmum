import { NavLink } from 'react-router-dom'

function Sidebar({ user }) {
  const isSuperAdmin = user.role === 'superadmin'
  const isPegawaiBiasa = user.role === 'pegawai'
  const isGuest = user.role === 'guest'

  // 🎯 Hak akses (Super Admin otomatis tembus semua)
  const isAdminKeuangan = user.role === 'admin_keuangan' || isSuperAdmin
  const isAdminKepegawaian = user.role === 'admin_kepegawaian' || isSuperAdmin

  const bolehKeuangan = isAdminKeuangan || isGuest
  const bolehDataPegawai = isAdminKepegawaian
  const bolehPelanggaran = isAdminKepegawaian || isPegawaiBiasa
  const bolehDataAbsensi = isAdminKepegawaian || isPegawaiBiasa

  const aktif = ({ isActive }) => 'menu-item' + (isActive ? ' active' : '')

  // 🏷️ Label role di user-card
  const getRoleLabel = () => {
    switch (user.role) {
      case 'superadmin': return '👑 Super Admin'
      case 'admin_keuangan': return '💰 Admin Keuangan'
      case 'admin_kepegawaian': return '👔 Admin Kepegawaian'
      case 'admin_rumahtangga': return '🏠 Admin Rumah Tangga'
      case 'guest': return `👁️ Guest ${user.bidang}`
      case 'pegawai': return `🙋 Pegawai • NIP ${user.nip}`
      default: return 'Pengguna'
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-circle">BC</div>
        <div>
          <h2>SI Umum</h2>
          <p>Kanwil DJBC Riau</p>
        </div>
      </div>

      {/* 💰 KEUANGAN — desain Delita, ditambah logika RBAC */}
      {bolehKeuangan && (
        <>
          <div className="nav-label">Keuangan</div>
          <nav>
            <NavLink to="/program-kerja" className={aktif}>📋 Program Kerja</NavLink>
            <NavLink to="/anggaran" className={aktif}>💰 Penyerapan Anggaran</NavLink>
          </nav>
        </>
      )}

      {/* 🏠 RUMAH TANGGA — semua role bisa akses */}
      <div className="nav-label">Rumah Tangga</div>
      <nav>
        <NavLink to="/data-ruangan" className={aktif}>🏢 Fasilitas</NavLink>
        <NavLink to="/booking-ruangan" className={aktif}>📅 Booking Ruangan</NavLink>
        <NavLink to="/kalender-ruangan" className={aktif}>🗓️ Kalender Ruangan</NavLink>
        <NavLink to="/kerusakan-ruangan" className={aktif}>🛠️ Kerusakan</NavLink>
        <NavLink to="/perbaikan-ruangan" className={aktif}>🔧 Perbaikan</NavLink>
      </nav>

      {/* 👔 KEPEGAWAIAN — struktur Delita, ditampilkan sesuai hak akses */}
      {(bolehDataPegawai || bolehPelanggaran || bolehDataAbsensi) && (
        <>
          <div className="nav-label">Kepegawaian</div>
          <nav>
            {bolehDataPegawai && <NavLink to="/data-pegawai" className={aktif}>📋 Data Pegawai</NavLink>}
            {bolehPelanggaran && <NavLink to="/pelanggaran" className={aktif}>⚠️ Pelanggaran</NavLink>}
            {bolehDataAbsensi && <NavLink to="/data-absensi" className={aktif}>📊 Data Absensi</NavLink>}
          </nav>
        </>
      )}

      <div className="user-card">
        <div className="user-avatar">{user.nama.charAt(0)}</div>
        <div>
          <h5>{user.nama}</h5>
          <p>{getRoleLabel()}</p>
        </div>
      </div>

      <div className="sidebar-footer">© 2026 Kanwil DJBC Riau</div>
    </aside>
  )
}

export default Sidebar