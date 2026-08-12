import { useState } from 'react'

const daftarAkun = [
  // === ADMIN ===
  { username: 'admin', password: 'admin123', nama: 'Admin Sistem', role: 'admin', bidang: 'semua' },

  // === GUEST BIDANG ===
  { username: 'umum', password: 'umum123', nama: 'Guest Umum', role: 'guest', bidang: 'Umum' },
  { username: 'p2', password: 'p2123', nama: 'Guest P2', role: 'guest', bidang: 'P2' },
  { username: 'ki', password: 'ki123', nama: 'Guest KI', role: 'guest', bidang: 'KI' },
  { username: 'pabean', password: 'pabean123', nama: 'Guest Pabean', role: 'guest', bidang: 'Pabean' },
  { username: 'fasilitas', password: 'fasilitas123', nama: 'Guest Fasilitas', role: 'guest', bidang: 'Fasilitas' },

  // === PEGAWAI (Username = NIP, Password Default = 123456) ===
  { username: '234', password: '123456', nama: 'Alya Deka Danisha', role: 'pegawai', idPegawai: 1, nip: '234', bidang: 'Umum' },
  { username: '235', password: '123456', nama: 'Budi Santoso', role: 'pegawai', idPegawai: 2, nip: '235', bidang: 'P2' },
  { username: '236', password: '123456', nama: 'Citra Lestari', role: 'pegawai', idPegawai: 3, nip: '236', bidang: 'KI' },
]

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const akun = daftarAkun.find((a) => a.username === username && a.password === password)
    if (akun) {
      onLogin({
        nama: akun.nama,
        role: akun.role,
        bidang: akun.bidang,
        idPegawai: akun.idPegawai,
        nip: akun.nip, // NIP dikirim ke state user
      })
    } else {
      setError('NIP/Username atau password salah!')
    }
  }

  return (
    <div className="login-wrap">
      <form onSubmit={submit} className="login-card">
        <div className="logo-circle">BC</div>
        <h1>SI Umum</h1>
        <p>Kanwil DJBC Riau</p>
        <input type="text" placeholder="NIP / Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <div className="login-error">{error}</div>}
        <button type="submit" className="btn">Masuk</button>
      </form>
    </div>
  )
}

export default Login