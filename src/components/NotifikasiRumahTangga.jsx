import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, X } from 'lucide-react'

const API = 'http://localhost:8000/api'

// 🔔 Notifikasi Rumah Tangga -- widget mengambang di pojok kanan bawah,
// mirip notifikasi web pada umumnya. Isinya daftar booking & kerusakan
// yang masih berstatus "Menunggu", supaya Admin Rumah Tangga gak perlu
// bolak-balik cek tiap halaman satu-satu.
function NotifikasiRumahTangga({ user }) {
  const navigate = useNavigate()
  const isAdminRT = user.role === 'admin_rumahtangga' || user.role === 'superadmin'

  const [terbuka, setTerbuka] = useState(false)
  const [daftar, setDaftar] = useState([])

  useEffect(() => {
    if (!isAdminRT) return

    let batal = false

    const muatNotifikasi = async () => {
      try {
        const [resBooking, resKerusakanRuangan, resKerusakanMobil] =
          await Promise.all([
            fetch(API + '/booking_ruangan'),
            fetch(API + '/kerusakan_ruangan'),
            fetch(API + '/kerusakan_mobil'),
          ])

        const [jsonBooking, jsonKerusakanRuangan, jsonKerusakanMobil] =
          await Promise.all([
            resBooking.json(),
            resKerusakanRuangan.json(),
            resKerusakanMobil.json(),
          ])

        if (batal) return

        const booking = (jsonBooking?.data || [])
          .filter((b) => b.status === 'Menunggu')
          .map((b) => ({
            id: 'booking-' + b.id,
            teks: `Booking "${b.kegiatan}" oleh ${b.pemesan} (${b.ruangan}) masih menunggu persetujuan.`,
            tujuan: '/booking-ruangan',
          }))

        const kerusakanRuangan = (jsonKerusakanRuangan?.data || [])
          .filter((k) => k.status === 'Menunggu')
          .map((k) => ({
            id: 'kerusakan-ruangan-' + k.id,
            teks: `Laporan kerusakan ruangan "${k.ruangan}": ${k.kerusakan}.`,
            tujuan: '/kerusakan',
          }))

        const kerusakanMobil = (jsonKerusakanMobil?.data || [])
          .filter((k) => k.status === 'Menunggu')
          .map((k) => ({
            id: 'kerusakan-mobil-' + k.id,
            teks: `Laporan kerusakan mobil "${k.mobil}": ${k.kerusakan}.`,
            tujuan: '/kerusakan',
          }))

        setDaftar([...booking, ...kerusakanRuangan, ...kerusakanMobil])
      } catch (err) {
        // gagal diam-diam -- widget cuma gak nampilin apa-apa
      }
    }

    muatNotifikasi()
    const interval = setInterval(muatNotifikasi, 30000)

    return () => {
      batal = true
      clearInterval(interval)
    }
  }, [isAdminRT])

  if (!isAdminRT) return null

  return (
    <div
      style={{
        position: 'fixed',
        right: '24px',
        bottom: '24px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '10px',
      }}
    >
      {/* PANEL DAFTAR NOTIFIKASI */}
      {terbuka && (
        <div
          style={{
            width: '320px',
            maxHeight: '380px',
            overflowY: 'auto',
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 8px 28px rgba(15, 23, 42, 0.18)',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderBottom: '1px solid #f1f5f9',
              fontWeight: 700,
              fontSize: '13px',
              color: '#0f172a',
            }}
          >
            Notifikasi Rumah Tangga
            <button
              type="button"
              onClick={() => setTerbuka(false)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#64748b',
                display: 'flex',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {daftar.length === 0 ? (
            <div style={{ padding: '18px 14px', fontSize: '12.5px', color: '#94a3b8' }}>
              Tidak ada notifikasi baru.
            </div>
          ) : (
            daftar.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTerbuka(false)
                  navigate(item.tujuan)
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '11px 14px',
                  border: 'none',
                  borderBottom: '1px solid #f8fafc',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  color: '#334155',
                  lineHeight: '1.4',
                }}
              >
                {item.teks}
              </button>
            ))
          )}
        </div>
      )}

      {/* TOMBOL BEL MENGAMBANG */}
      <button
        type="button"
        onClick={() => setTerbuka(!terbuka)}
        style={{
          position: 'relative',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: '#0b72e7',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 6px 18px rgba(11, 114, 231, 0.45)',
        }}
      >
        <Bell size={22} />
        {daftar.length > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              backgroundColor: '#ef4444',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 700,
              borderRadius: '999px',
              padding: '1px 6px',
              minWidth: '18px',
              textAlign: 'center',
              border: '2px solid #fff',
            }}
          >
            {daftar.length}
          </span>
        )}
      </button>
    </div>
  )
}

export default NotifikasiRumahTangga