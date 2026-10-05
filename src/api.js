const API = 'http://10.20.32.56:8000/api'

/**
 * Pengganti fetch() yang otomatis mengirim token login.
 * Otomatis mendeteksi:
 * - Kalau body-nya FormData (upload file) → Content-Type biarkan browser yang set
 * - Kalau body-nya object biasa → pakai application/json
 */
export async function api(path, options = {}) {
  const token = localStorage.getItem('token')

  // Cek apakah body-nya FormData (untuk upload file)?
  const isFormData = options.body instanceof FormData

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return fetch(API + path, {
    ...options,
    headers,
  })
}