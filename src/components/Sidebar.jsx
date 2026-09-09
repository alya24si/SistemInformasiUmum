import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'

const API = 'http://localhost:8000/api'

/* ========================================================= */
/* ✨ ICON SET (stroke flat style, seperti icon VS Code)      */
/*    Ukuran default 15px, pas untuk sidebar menu item       */
/* ========================================================= */
const SvgIkon = ({ children, size = 15, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ verticalAlign: '-3px', ...style }}
  >
    {children}
  </svg>
)

const IkonClipboard = (p) => (
  <SvgIkon {...p}>
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
  </SvgIkon>
)

const IkonWallet = (p) => (
  <SvgIkon {...p}>
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
  </SvgIkon>
)

const IkonBuilding = (p) => (
  <SvgIkon {...p}>
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </SvgIkon>
)

const IkonCalendar = (p) => (
  <SvgIkon {...p}>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </SvgIkon>
)

const IkonCalendarDays = (p) => (
  <SvgIkon {...p}>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
    <path d="M8 14h.01" />
    <path d="M12 14h.01" />
    <path d="M16 14h.01" />
    <path d="M8 18h.01" />
    <path d="M12 18h.01" />
    <path d="M16 18h.01" />
  </SvgIkon>
)

const IkonWrench = (p) => (
  <SvgIkon {...p}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </SvgIkon>
)

const IkonSettings = (p) => (
  <SvgIkon {...p}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </SvgIkon>
)

const IkonHome = (p) => (
  <SvgIkon {...p}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </SvgIkon>
)

const IkonCar = (p) => (
  <SvgIkon {...p}>
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </SvgIkon>
)

const IkonUsers = (p) => (
  <SvgIkon {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </SvgIkon>
)

const IkonAlertTriangle = (p) => (
  <SvgIkon {...p}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </SvgIkon>
)

const IkonChart = (p) => (
  <SvgIkon {...p}>
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </SvgIkon>
)

const IkonShield = (p) => (
  <SvgIkon {...p}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  </SvgIkon>
)

const IkonMoney = (p) => (
  <SvgIkon {...p}>
    <rect width="20" height="12" x="2" y="6" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01" />
    <path d="M18 12h.01" />
  </SvgIkon>
)

const IkonUserTie = (p) => (
  <SvgIkon {...p}>
    <circle cx="12" cy="7" r="4" />
    <path d="M5.5 21a8.38 8.38 0 0 1 13 0" />
    <path d="M12 11v4" />
    <path d="M10 15l2 4 2-4" />
  </SvgIkon>
)

const IkonHouse = (p) => (
  <SvgIkon {...p}>
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </SvgIkon>
)

const IkonEye = (p) => (
  <SvgIkon {...p}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </SvgIkon>
)

const IkonUser = (p) => (
  <SvgIkon {...p}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </SvgIkon>
)

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

  const location = useLocation()

  // Submenu Kerusakan & Perbaikan bisa di-expand/collapse. Defaultnya
  // TERTUTUP (biar sidebar gak penuh pas pertama buka web) -- kecuali
  // kalau pas dibuka/refresh usernya emang lagi ada di halaman itu,
  // baru otomatis kebuka biar menu yang aktif gak "hilang" ketutup.
  const [bukaKerusakan, setBukaKerusakan] = useState(
    () => location.pathname === '/kerusakan'
  )
  const [bukaPerbaikan, setBukaPerbaikan] = useState(
    () => location.pathname === '/perbaikan'
  )

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
      case 'superadmin':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <IkonShield size={12} /> Super Admin
          </span>
        )
      case 'admin_keuangan':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <IkonMoney size={12} /> Admin Keuangan
          </span>
        )
      case 'admin_kepegawaian':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <IkonUserTie size={12} /> Admin Kepegawaian
          </span>
        )
      case 'admin_rumahtangga':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <IkonHouse size={12} /> Admin Rumah Tangga
          </span>
        )
      case 'guest':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <IkonEye size={12} /> Guest {user.bidang}
          </span>
        )
      case 'pegawai':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <IkonUser size={12} /> Pegawai • NIP {user.nip}
          </span>
        )
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
            <NavLink to="/program-kerja" className={aktif}>
              <IkonClipboard size={15} /> Program Kerja
            </NavLink>
            <NavLink to="/anggaran" className={aktif}>
              <IkonWallet size={15} /> Penyerapan Anggaran
            </NavLink>
          </nav>
        </>
      )}

      {/* 🏠 RUMAH TANGGA */}
      <div className="nav-label">Rumah Tangga</div>
      <nav>
        <NavLink to="/data-ruangan" className={aktif}>
          <IkonBuilding size={15} /> Fasilitas
        </NavLink>
        <NavLink
          to="/booking-ruangan"
          className={aktif}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            <IkonCalendar size={15} /> Booking Ruangan
          </span>
          <BadgeNotif count={jumlahBookingMenunggu} />
        </NavLink>
        <NavLink to="/kalender-ruangan" className={aktif}>
          <IkonCalendarDays size={15} /> Kalender Ruangan
        </NavLink>

        {/* Kerusakan — dropdown, submenu Ruangan/Mobil masing-masing
            punya badge notifikasi sendiri */}
        <div
          className="menu-item"
          style={groupHeaderStyle}
          onClick={() => setBukaKerusakan((v) => !v)}
        >
          <span style={{ flex: 1, display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <IkonWrench size={15} /> Kerusakan
          </span>
          <BadgeNotif count={jumlahKerusakanMenunggu} />
          {bukaKerusakan ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>

        {bukaKerusakan && (
          <>
            <NavLink to="/kerusakan?tab=ruangan" className={kelasSub(subAktif('/kerusakan', 'ruangan'))} style={subIndentStyle}>
              <span style={{ flex: 1, display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                <IkonHome size={14} /> Ruangan
              </span>
              <BadgeNotif count={jumlahKerusakanRuanganMenunggu} />
            </NavLink>
            <NavLink to="/kerusakan?tab=mobil" className={kelasSub(subAktif('/kerusakan', 'mobil'))} style={subIndentStyle}>
              <span style={{ flex: 1, display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                <IkonCar size={14} /> Mobil
              </span>
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
          <span style={{ flex: 1, display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <IkonSettings size={15} /> Perbaikan
          </span>
          {bukaPerbaikan ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>

        {bukaPerbaikan && (
          <>
            <NavLink to="/perbaikan?tab=ruangan" className={kelasSub(subAktif('/perbaikan', 'ruangan'))} style={subIndentStyle}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                <IkonHome size={14} /> Ruangan
              </span>
            </NavLink>
            <NavLink to="/perbaikan?tab=mobil" className={kelasSub(subAktif('/perbaikan', 'mobil'))} style={subIndentStyle}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                <IkonCar size={14} /> Mobil
              </span>
            </NavLink>
          </>
        )}
      </nav>

      {/* 👔 KEPEGAWAIAN */}
      {(bolehDataPegawai || bolehPelanggaran || bolehDataAbsensi) && (
        <>
          <div className="nav-label">Kepegawaian</div>
          <nav>
            {bolehDataPegawai && (
              <NavLink to="/data-pegawai" className={aktif}>
                <IkonUsers size={15} /> Data Pegawai
              </NavLink>
            )}
            {bolehPelanggaran && (
              <NavLink to="/pelanggaran" className={aktif}>
                <IkonAlertTriangle size={15} /> Pelanggaran
              </NavLink>
            )}
            {bolehDataAbsensi && (
              <NavLink to="/data-absensi" className={aktif}>
                <IkonChart size={15} /> Data Absensi
              </NavLink>
            )}
          </nav>
        </>
      )}

      {/* 🟢 KANG CEPOT — section tersendiri di bawah Kepegawaian
          (TIDAK DIUBAH sesuai permintaan) */}
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