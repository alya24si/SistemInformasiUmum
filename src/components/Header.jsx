function Header({ user, onLogout }) {
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

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
          <p>{user.role === 'admin' ? '🛡️ Admin' : '👁️ Guest (view only)'}</p>
        </div>
        <button className="btn-logout" onClick={onLogout}>Keluar</button>
      </div>
    </header>
  )
}

export default Header