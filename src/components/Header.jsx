function Header() {
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
        <div className="header-avatar">AD</div>
      </div>
    </header>
  )
}

export default Header