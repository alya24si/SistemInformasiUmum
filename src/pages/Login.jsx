import { useState } from 'react'

const daftarAkun = [
  { username: 'admin', password: 'admin123', nama: 'Admin', role: 'admin', bidang: 'semua' },
  { username: 'umum', password: 'umum123', nama: 'Guest Umum', role: 'guest', bidang: 'Umum' },
  { username: 'p2', password: 'p2123', nama: 'Guest P2', role: 'guest', bidang: 'P2' },
  { username: 'ki', password: 'ki123', nama: 'Guest KI', role: 'guest', bidang: 'KI' },
  { username: 'pabean', password: 'pabean123', nama: 'Guest Pabean', role: 'guest', bidang: 'Pabean' },
  { username: 'fasilitas', password: 'fasilitas123', nama: 'Guest Fasilitas', role: 'guest', bidang: 'Fasilitas' },
]

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const akun = daftarAkun.find((a) => a.username === username && a.password === password)
    if (akun) {
      onLogin({ nama: akun.nama, role: akun.role, bidang: akun.bidang })
    } else {
      setError('Username atau password salah!')
    }
  }

  return (
    <div className="login-wrap">
      <form onSubmit={submit} className="login-card">
        <div className="logo-circle">BC</div>
        <h1>SI Umum</h1>
        <p>Kanwil DJBC Riau</p>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <div className="login-error">{error}</div>}
        <button type="submit" className="btn">Masuk</button>
      </form>
    </div>
  )
}

export default Login