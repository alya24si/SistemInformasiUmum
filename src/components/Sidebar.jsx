import { NavLink } from 'react-router-dom'

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-circle">BC</div>
        <div>
          <h2>SI Umum</h2>
          <p>Kanwil DJBC Riau</p>
        </div>
      </div>

      <div className="nav-label">Menu Utama</div>
      <nav>
        <NavLink to="/program-kerja" className="menu-item">📋 Program Kerja</NavLink>
        <NavLink to="/anggaran" className="menu-item">💰 Penyerapan Anggaran</NavLink>
      </nav>

      <div className="user-card">
        <div className="user-avatar">AD</div>
        <div>
          <h5>Alya Deka D.</h5>
          <p>Staff Magang — Tim Developer</p>
        </div>
      </div>

      <div className="sidebar-footer">© 2026 Kanwil DJBC Riau</div>
    </aside>
  )
}

export default Sidebar