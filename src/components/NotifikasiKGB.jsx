import { useEffect, useState } from 'react'
import { TrendingUp, X } from 'lucide-react'

const API_URL = 'http://127.0.0.1:8000/api'

// Sama persis logikanya kayak di KenaikanGajiBerkala.jsx -- lihat file itu
// untuk penjelasan lengkap kenapa dihitung begini (siklus 4 tahun dari TMT
// Pangkat, otomatis maju sendiri seiring waktu).
const tambahTahun = (tanggal, jumlahTahun) => {
  const hasil = new Date(tanggal)
  hasil.setFullYear(hasil.getFullYear() + jumlahTahun)
  return hasil
}

const kurangiBulan = (tanggal, jumlahBulan) => {
  const hasil = new Date(tanggal)
  hasil.setMonth(hasil.getMonth() - jumlahBulan)
  return hasil
}

const hitungKGB = (tmtPangkatAwal) => {
  if (!tmtPangkatAwal) return null

  const tmtAwal = new Date(`${tmtPangkatAwal}T00:00:00`)
  if (isNaN(tmtAwal.getTime())) return null

  const sekarang = new Date()

  let tmtPangkat = tmtAwal
  let kgbBerikutnya = tambahTahun(tmtAwal, 4)

  while (kgbBerikutnya <= sekarang) {
    tmtPangkat = kgbBerikutnya
    kgbBerikutnya = tambahTahun(tmtPangkat, 4)
  }

  return { tmtPangkat, kgbBerikutnya }
}

const formatTanggal = (tanggal) => {
  if (!tanggal) return '-'
  return tanggal.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// Kunci sessionStorage -- ditutup sekali, gak nongol lagi sampai tab
// browser ditutup / logout-login ulang (beda tab/sesi baru = nongol lagi).
// Ini SENGAJA terpisah dari popup yang ada di dalam halaman Kenaikan Gaji
// Berkala itu sendiri -- kalau admin buka halaman itu langsung, popup di
// SANA tetap nongol setiap kali (gak kena sessionStorage ini).
const KUNCI_SESSION = 'popupKGBGlobalDitutup'

function NotifikasiKGB({ user }) {
  const isAdmin =
    user?.role === 'admin_kepegawaian' || user?.role === 'superadmin'

  const [akanNaikDalam2Bulan, setAkanNaikDalam2Bulan] = useState([])
  const [tampilkan, setTampilkan] = useState(false)

  useEffect(() => {
    if (!isAdmin) return

    // Udah pernah ditutup di sesi/tab ini -- gak usah fetch/tampil lagi.
    if (sessionStorage.getItem(KUNCI_SESSION)) return

    fetch(`${API_URL}/pegawai`)
      .then((res) => res.json())
      .then((res) => {
        const data = res.data || []
        const sekarang = new Date()

        const daftar = data
          .map((pegawai) => ({ ...pegawai, kgb: hitungKGB(pegawai.tmt_pangkat) }))
          .filter((pegawai) => {
            if (!pegawai.kgb) return false
            const batasNotif = kurangiBulan(pegawai.kgb.kgbBerikutnya, 2)
            return sekarang >= batasNotif && sekarang <= pegawai.kgb.kgbBerikutnya
          })
          .sort((a, b) => a.kgb.kgbBerikutnya - b.kgb.kgbBerikutnya)

        if (daftar.length > 0) {
          setAkanNaikDalam2Bulan(daftar)
          setTampilkan(true)
        }
      })
      .catch(() => {
        // Gagal diam-diam -- popup notifikasi gak boleh sampai ganggu
        // pemakaian aplikasi kalau API-nya lagi bermasalah.
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  const tutupPopup = () => {
    sessionStorage.setItem(KUNCI_SESSION, '1')
    setTampilkan(false)
  }

  if (!isAdmin || !tampilkan || akanNaikDalam2Bulan.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,31,69,.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'kgbGlobalOverlayFade 0.3s ease-out',
      }}
    >
      <div
        style={{
          width: '520px',
          maxWidth: '94%',
          maxHeight: '86vh',
          overflowY: 'auto',
          background: 'linear-gradient(145deg, #ffffff 0%, #fef2f2 100%)',
          borderRadius: '20px',
          padding: '36px 32px',
          textAlign: 'center',
          boxShadow: '0 25px 60px rgba(220,38,38,.4)',
          border: '4px solid #dc2626',
          animation: 'kgbGlobalPopupZoomIn 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #dc2626, #f59e0b, #dc2626)',
          }}
        />

        <button
          type="button"
          onClick={tutupPopup}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={16} color="#475569" />
        </button>

        <div
          style={{
            marginBottom: '8px',
            display: 'inline-block',
            filter: 'drop-shadow(0 4px 8px rgba(220,38,38,.3))',
          }}
        >
          <TrendingUp size={64} style={{ color: '#dc2626' }} />
        </div>

        <h2
          style={{
            margin: '0 0 6px 0',
            color: '#991b1b',
            fontSize: '22px',
            fontWeight: 900,
          }}
        >
          Ada yang naik gaji berkala nih
        </h2>

        <p
          style={{
            margin: '0 0 18px',
            fontSize: '13px',
            color: '#7f1d1d',
            fontWeight: 700,
          }}
        >
          Segera usulkan KGB TMT (Berdasarkan KGB Terakhir)
        </p>

        <div
          style={{
            backgroundColor: '#fee2e2',
            border: '2px solid #fca5a5',
            borderRadius: '12px',
            padding: '8px',
            textAlign: 'left',
          }}
        >
          {akanNaikDalam2Bulan.map((pegawai) => (
            <div
              key={pegawai.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                borderBottom: '1px solid #fecaca',
                fontSize: '13px',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>
                  {pegawai.nama}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {pegawai.nip}
                </div>
              </div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#fff',
                  background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                  padding: '4px 10px',
                  borderRadius: '999px',
                }}
              >
                {formatTanggal(pegawai.kgb.kgbBerikutnya)}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={tutupPopup}
          style={{
            marginTop: '22px',
            padding: '12px 32px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(220,38,38,.4)',
          }}
        >
          Oke, Mengerti
        </button>
      </div>

      <style>{`
        @keyframes kgbGlobalOverlayFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes kgbGlobalPopupZoomIn {
          0% { opacity: 0; transform: scale(0.7); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

export default NotifikasiKGB