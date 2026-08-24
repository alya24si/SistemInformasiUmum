import { useState } from 'react'

const API = 'http://localhost:8000/api'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(API + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const json = await res.json()

      if (json.success) {
        // Simpan ke localStorage (biar ingat login walau refresh)
        localStorage.setItem('user', JSON.stringify(json.user))
        onLogin(json.user)
      } else {
        setError(json.message || 'Username atau password salah!')
      }
    } catch (err) {
      setError('Tidak bisa terhubung ke server. Pastikan backend nyala!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrap">
      <form onSubmit={submit} className="login-card">
        <div className="logo-circle">BC</div>
        <h1>SI Umum</h1>
        <p>Kanwil DJBC Riau</p>
        <input
          type="text"
          placeholder="Username / NIP"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        {error && <div className="login-error">{error}</div>}
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Memeriksa...' : 'Masuk'}
        </button>

        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
          <b style={{ color: '#334155' }}>🔑 Akun tes:</b><br />
          superadmin / admin123<br />
          keuangan / admin123<br />
          guest.p2 / guest123<br />
          197103061990121001 / Mury90#
        </div>
      </form>
    </div>
  )
}

export default Login