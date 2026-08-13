function Header({ user, onLogout }) {
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // 🎯 Label role sesuai sistem RBAC
  const getRoleLabel = () => {
    switch (user.role) {
      case 'superadmin':
        return '👑 Super Admin • Semua Bidang'
      case 'admin_keuangan':
        return '💰 Admin Keuangan'
      case 'admin_kepegawaian':
        return '👔 Admin Kepegawaian'
      case 'admin_rumahtangga':
        return '🏠 Admin Rumah Tangga'
      case 'guest':
        return `👁️ Guest • Bidang ${user.bidang}`
      case 'pegawai':
        return `🙋 Pegawai • NIP ${user.nip}`
      default:
        return 'Pengguna'
    }
  }

  return (
    <header className="header">
      <div className="header-left">
        <h1>Sistem Informasi Umum</h1>
        <p>Kementerian Keuangan RI — Direktorat Jenderal Bea dan Cukai</p>
      </div>
      <div className="header-right">
        <div className="header-date">📅 {today}</div>
        <div className="header-avatar">{user.nama.charAt(0)}</div>
        <div className="header-user">
          <h5>{user.nama}</h5>
          <p>{getRoleLabel()}</p>
        </div>
        <button className="btn-logout" onClick={onLogout}>Keluar</button>
      </div>
    </header>
  )
}

export default Header