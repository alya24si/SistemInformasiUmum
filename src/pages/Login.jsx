import { useState } from 'react'

const API = 'http://localhost:8000/api'

// Ikon mata terbuka
const IconEye = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

// Ikon mata dicoret
const IconEyeOff = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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

        <div className="password-wrap">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button
            type="button"
            className="pw-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <IconEyeOff /> : <IconEye />}
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Memeriksa...' : 'Masuk'}
        </button>
      </form>
    </div>
  )
}

export default Login