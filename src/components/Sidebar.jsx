import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'

const API = 'http://localhost:8000/api'

// Badge angka kecil, cuma muncul kalau count > 0
function BadgeNotif({ count }) {
  if (!count) return null

  return (
    <span
      style={{
        marginLeft: 'auto',
        backgroundColor: '#ef4444',
        color: '#fff',
        fontSize: '10px',
        fontWeight: 700,
        borderRadius: '999px',
        padding: '1px 7px',
        minWidth: '18px',
        textAlign: 'center',
        lineHeight: '16px',
      }}
    >
      {count}
    </span>
  )
}

function Sidebar({ user }) {

  const isSuperAdmin = user.role === 'superadmin'
  const isPegawaiBiasa = user.role === 'pegawai'
  const isGuest = user.role === 'guest'

  const isAdminKeuangan = user.role === 'admin_keuangan' || isSuperAdmin
  const isAdminKepegawaian = user.role === 'admin_kepegawaian' || isSuperAdmin
  const isAdminRT = user.role === 'admin_rumahtangga' || isSuperAdmin

  const bolehKeuangan = isAdminKeuangan || isGuest
  const bolehDataPegawai = isAdminKepegawaian
  const bolehPelanggaran = isAdminKepegawaian || isPegawaiBiasa
  const bolehDataAbsensi = isAdminKepegawaian || isPegawaiBiasa

  // 🟢 KANG CEPOT khusus Admin Keuangan & Superadmin
  const bolehKangCepot = isAdminKeuangan || isPegawaiBiasa

  // 🔔 Notifikasi Admin Rumah Tangga: jumlah booking & kerusakan yang
  // masih berstatus "Menunggu" (Ruangan & Mobil dihitung terpisah supaya
  // bisa ditampilkan sebagai badge masing-masing di submenu).
  const [jumlahBookingMenunggu, setJumlahBookingMenunggu] = useState(0)
  const [jumlahKerusakanRuanganMenunggu, setJumlahKerusakanRuanganMenunggu] = useState(0)
  const [jumlahKerusakanMobilMenunggu, setJumlahKerusakanMobilMenunggu] = useState(0)
  const jumlahKerusakanMenunggu = jumlahKerusakanRuanganMenunggu + jumlahKerusakanMobilMenunggu

  // Submenu Kerusakan & Perbaikan bisa di-expand/collapse, defaultnya
  // sama-sama terbuka biar Ruangan/Mobil langsung kelihatan.
  const [bukaKerusakan, setBukaKerusakan] = useState(true)
  const [bukaPerbaikan, setBukaPerbaikan] = useState(true)

  const location = useLocation()

  // Submenu dianggap aktif kalau pathname cocok DAN query ?tab= cocok
  // (atau ?tab= gak ada sama sekali, dianggap "ruangan" karena itu
  // default tab di halaman Kerusakan/Perbaikan).
  const subAktif = (pathname, tabValue) => {
    if (location.pathname !== pathname) return false
    const tabUrl = new URLSearchParams(location.search).get('tab') || 'ruangan'
    return tabUrl === tabValue
  }

  const kelasSub = (aktifSub) => 'menu-item' + (aktifSub ? ' active' : '')
  const subIndentStyle = { paddingLeft: '34px', display: 'flex', alignItems: 'center' }

  // Cuma layout flex + cursor pointer -- font/warna/padding dasar
  // sengaja dibiarkan ikut className="menu-item" biar SAMA PERSIS
  // dengan tampilan menu lain (Booking Ruangan, Data Pegawai, dst),
  // bukan style custom sendiri yang bikin beda.
  const groupHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
  }

  useEffect(() => {
    if (!isAdminRT) return

    let batal = false

    const muatNotifikasi = async () => {
      try {
        const [resBooking, resKerusakanRuangan, resKerusakanMobil] =
          await Promise.all([
            fetch(API + '/booking_ruangan'),
            fetch(API + '/kerusakan_ruangan'),
            fetch(API + '/kerusakan_mobil'),
          ])

        const [jsonBooking, jsonKerusakanRuangan, jsonKerusakanMobil] =
          await Promise.all([
            resBooking.json(),
            resKerusakanRuangan.json(),
            resKerusakanMobil.json(),
          ])

        if (batal) return

        const booking = jsonBooking?.data || []
        const kerusakanRuangan = jsonKerusakanRuangan?.data || []
        const kerusakanMobil = jsonKerusakanMobil?.data || []

        setJumlahBookingMenunggu(
          booking.filter((b) => b.status === 'Menunggu').length
        )

        setJumlahKerusakanRuanganMenunggu(
          kerusakanRuangan.filter((k) => k.status === 'Menunggu').length
        )

        setJumlahKerusakanMobilMenunggu(
          kerusakanMobil.filter((k) => k.status === 'Menunggu').length
        )
      } catch (err) {
        // gagal diam-diam — badge cuma gak muncul, gak ganggu sidebar
      }
    }

    muatNotifikasi()

    // Refresh berkala tiap 30 detik biar angkanya gak basi kelamaan
    const interval = setInterval(muatNotifikasi, 30000)

    return () => {
      batal = true
      clearInterval(interval)
    }
  }, [isAdminRT])

  const aktif = ({ isActive }) => 'menu-item' + (isActive ? ' active' : '')

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

      {/* 💰 KEUANGAN */}
      {bolehKeuangan && (
        <>
          <div className="nav-label">Keuangan</div>
          <nav>
            <NavLink to="/program-kerja" className={aktif}>📋 Program Kerja</NavLink>
            <NavLink to="/anggaran" className={aktif}>💰 Penyerapan Anggaran</NavLink>
          </nav>
        </>
      )}

      {/* 🏠 RUMAH TANGGA */}
      <div className="nav-label">Rumah Tangga</div>
      <nav>
        <NavLink to="/data-ruangan" className={aktif}>🏢 Fasilitas</NavLink>
        <NavLink
          to="/booking-ruangan"
          className={aktif}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <span>📅 Booking Ruangan</span>
          <BadgeNotif count={jumlahBookingMenunggu} />
        </NavLink>
        <NavLink to="/kalender-ruangan" className={aktif}>🗓️ Kalender Ruangan</NavLink>

        {/* Kerusakan — dropdown, submenu Ruangan/Mobil masing-masing
            punya badge notifikasi sendiri */}
        <div
          className="menu-item"
          style={groupHeaderStyle}
          onClick={() => setBukaKerusakan((v) => !v)}
        >
          <span style={{ flex: 1 }}>🛠️ Kerusakan</span>
          <BadgeNotif count={jumlahKerusakanMenunggu} />
          {bukaKerusakan ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>

        {bukaKerusakan && (
          <>
            <NavLink to="/kerusakan?tab=ruangan" className={kelasSub(subAktif('/kerusakan', 'ruangan'))} style={subIndentStyle}>
              <span style={{ flex: 1 }}>🏢 Ruangan</span>
              <BadgeNotif count={jumlahKerusakanRuanganMenunggu} />
            </NavLink>
            <NavLink to="/kerusakan?tab=mobil" className={kelasSub(subAktif('/kerusakan', 'mobil'))} style={subIndentStyle}>
              <span style={{ flex: 1 }}>🚗 Mobil</span>
              <BadgeNotif count={jumlahKerusakanMobilMenunggu} />
            </NavLink>
          </>
        )}

        {/* Perbaikan — dropdown, submenu Ruangan/Mobil (gak ada badge,
            karena perbaikan gak termasuk yang dinotifikasikan) */}
        <div
          className="menu-item"
          style={groupHeaderStyle}
          onClick={() => setBukaPerbaikan((v) => !v)}
        >
          <span style={{ flex: 1 }}>🔧 Perbaikan</span>
          {bukaPerbaikan ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>

        {bukaPerbaikan && (
          <>
            <NavLink to="/perbaikan?tab=ruangan" className={kelasSub(subAktif('/perbaikan', 'ruangan'))} style={subIndentStyle}>
              <span>🏢 Ruangan</span>
            </NavLink>
            <NavLink to="/perbaikan?tab=mobil" className={kelasSub(subAktif('/perbaikan', 'mobil'))} style={subIndentStyle}>
              <span>🚗 Mobil</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* 👔 KEPEGAWAIAN */}
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

      {/* 🟢 KANG CEPOT — section tersendiri di bawah Kepegawaian */}
      {bolehKangCepot && (
        <>
          <div className="nav-label">KANG CEPOT</div>
          <nav>
            <NavLink
              to="/kang-cepot"
              className={aktif}
              style={{
                backgroundImage:
                  'linear-gradient(rgba(16, 42, 67, 0.82), rgba(16, 42, 67, 0.88)), url(/kang-cepot.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '10px',
                color: '#ffd76e',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                padding: '10px 14px',
                margin: '4px 8px',
              }}
            >
              <img
                src="/kang-cepot.png"
                alt="Kang Cepot"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #ffc72c',
                  marginRight: '10px',
                }}
              />
              KANG CEPOT
            </NavLink>
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