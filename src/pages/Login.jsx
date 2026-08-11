import { useState } from 'react'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (username === 'admin' && password === 'admin123') {
      onLogin({ nama: 'Admin', role: 'admin' })
    } else if (username === 'guest' && password === 'guest123') {
      onLogin({ nama: 'Tamu', role: 'guest' })
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
        <div className="login-hint">Admin: admin / admin123 • Guest: guest / guest123</div>
      </form>
    </div>
  )
}

export default Login