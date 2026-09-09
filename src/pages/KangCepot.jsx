import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'

const API = 'http://localhost:8000/api'

const daftarBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const tahunIni = new Date().getFullYear()

const cariKolom = (row, ...kemungkinan) => {
  for (const key of Object.keys(row)) {
    const k = key.toLowerCase().replace(/\s+/g, '')
    for (const nama of kemungkinan) {
      if (k === nama.toLowerCase().replace(/\s+/g, '')) return row[key]
    }
  }
  return ''
}

const angka = (v) => Number(String(v).replace(/[^\d]/g, '')) || 0
const formatTitik = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

const nomorWa = (no) => {
  let n = String(no || '').replace(/[^\d]/g, '')
  if (n.startsWith('0')) n = '62' + n.slice(1)
  else if (n.startsWith('8')) n = '62' + n
  return n
}

const buatPesan = (d) =>
`Selamat pagi, mohon izin dari Subbagian Tata Usaha dan Keuangan menginfokan Pejabat/Pegawai yang saldonya tidak di autodebet dengan rincian sebagai berikut :

Nama : ${d.nama}
DPP : ${formatTitik(d.dpp)}
Bapors : ${formatTitik(d.bapors)}
Keagamaan: ${formatTitik(d.keagamaan)}

Total : ${formatTitik(d.total)}

Mohon agar dapat mentransfer ke nomor rekening BNI "1910250198" (Tia Agustina) atau secara cash ke Ruangan Subbagian Tata Usaha dan Keuangan di Lantai 2.
Terima kasih 🙏🏻`

/* ========================================================= */
/* ✨ ICON SET (stroke flat style, seperti icon VS Code)      */
/* ========================================================= */
const SvgIkon = ({ children, size = 18, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ verticalAlign: '-4px', ...style }}
  >
    {children}
  </svg>
)

const IkonAlert = (p) => (
  <SvgIkon {...p}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </SvgIkon>
)

const IkonHand = (p) => (
  <SvgIkon {...p}>
    <path d="M18 11V6a2 2 0 0 0-4 0v5" />
    <path d="M14 10V4a2 2 0 0 0-4 0v2" />
    <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </SvgIkon>
)

const IkonWallet = (p) => (
  <SvgIkon {...p}>
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
  </SvgIkon>
)

const IkonClock = (p) => (
  <SvgIkon {...p}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </SvgIkon>
)

const IkonFolder = (p) => (
  <SvgIkon {...p}>
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
  </SvgIkon>
)

const IkonCalendar = (p) => (
  <SvgIkon {...p}>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </SvgIkon>
)

const IkonCheck = (p) => (
  <SvgIkon {...p}>
    <path d="M20 6 9 17l-5-5" />
  </SvgIkon>
)

const IkonX = (p) => (
  <SvgIkon {...p}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </SvgIkon>
)

const IkonLock = (p) => (
  <SvgIkon {...p}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </SvgIkon>
)

const IkonUpload = (p) => (
  <SvgIkon {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </SvgIkon>
)

const IkonPlus = (p) => (
  <SvgIkon {...p}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </SvgIkon>
)

const IkonSave = (p) => (
  <SvgIkon {...p}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </SvgIkon>
)

const IkonPencil = (p) => (
  <SvgIkon {...p}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </SvgIkon>
)

const IkonClipboard = (p) => (
  <SvgIkon {...p}>
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
  </SvgIkon>
)

const IkonSearch = (p) => (
  <SvgIkon {...p}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </SvgIkon>
)

const IkonMessage = (p) => (
  <SvgIkon {...p}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </SvgIkon>
)

const IkonTrash = (p) => (
  <SvgIkon {...p}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </SvgIkon>
)

function KangCepot({ user }) {
  const isAdmin = user.role === 'admin_keuangan' || user.role === 'superadmin'

  const [data, setData] = useState([])
  const [uploadInfo, setUploadInfo] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formTambah, setFormTambah] = useState({ nama: '', nip: '', no_hp: '', status_bayar: 'belum' })
  const [editing, setEditing] = useState(null)
  const [formEdit, setFormEdit] = useState({ nama: '', no_hp: '', dpp: '', bapors: '', keagamaan: '', status_bayar: 'belum' })
  const [filterStatus, setFilterStatus] = useState('semua')
  const [kelola, setKelola] = useState(null)
  const [profil, setProfil] = useState(null)
  const [popupDitutup, setPopupDitutup] = useState(false)

  const muatData = async () => {
    const res = await fetch(API + '/iuran')
    const json = await res.json()
    if (json.success) {
      setData(json.data.map((d) => ({
        ...d,
        dpp: Number(d.dpp), bapors: Number(d.bapors),
        keagamaan: Number(d.keagamaan), total: Number(d.total),
        status_bayar: d.status_bayar || 'belum',
      })))
    }
  }

  useEffect(() => { muatData() }, [])

  useEffect(() => {
    if (user.role === 'pegawai' && user.nip) {
      fetch(API + '/iuran/profil/' + user.nip)
        .then((r) => r.json())
        .then((j) => { setProfil(j.success ? j : false) })
        .catch(() => setProfil(false))
    }
  }, [user.role, user.nip])

  // ===== ✨ TAMPILAN PEGAWAI (dengan efek WOW) =====
  if (user.role === 'pegawai') {
    const bulananMap = {}
    ;(profil?.bulanan || []).forEach((b) => { bulananMap[b.bulan] = b.status })
    const belum = daftarBulan.filter((b) => bulananMap[b] !== 'sudah')

    const popupTagihan = profil && profil !== false && belum.length > 0 && !popupDitutup && (
      <div style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,31,69,.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
        animation: 'overlayFade 0.3s ease-out',
      }}>
        <div style={{
          width: '500px', maxWidth: '94%',
          background: 'linear-gradient(145deg, #ffffff 0%, #fef2f2 100%)',
          borderRadius: '20px',
          padding: '36px 32px', textAlign: 'center',
          boxShadow: '0 25px 60px rgba(220,38,38,.4)',
          border: '4px solid #dc2626',
          animation: 'popupZoomIn 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55), pulseRed 2s infinite',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '6px',
            background: 'linear-gradient(90deg, #dc2626, #f59e0b, #dc2626)',
          }} />

          <div style={{
            marginBottom: '8px',
            display: 'inline-block',
            animation: 'iconBounce 1.5s ease-in-out infinite',
            filter: 'drop-shadow(0 4px 8px rgba(220,38,38,.3))',
          }}>
            <IkonAlert size={70} style={{ color: '#dc2626', verticalAlign: 'middle' }} />
          </div>

          <h2 style={{
            margin: '0 0 6px 0', color: '#991b1b', fontSize: '24px',
            fontWeight: 900, letterSpacing: '1px',
            animation: 'slideUp 0.6s ease-out 0.3s backwards',
          }}>
            BELUM BAYAR IURAN BULANAN!!
          </h2>

          <div style={{
            fontSize: '36px', fontWeight: 900, color: '#dc2626',
            margin: '10px 0 18px',
            animation: 'numberShake 0.8s ease-in-out 0.8s, slideUp 0.6s ease-out 0.4s backwards',
            background: 'linear-gradient(135deg, #dc2626, #991b1b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {belum.length} BULAN MENUNGGAK
          </div>

          <div style={{
            backgroundColor: '#fee2e2', border: '2px solid #fca5a5',
            borderRadius: '12px', padding: '16px 18px',
            fontSize: '14px', color: '#7f1d1d', lineHeight: 1.7, textAlign: 'left',
            animation: 'slideUp 0.6s ease-out 0.5s backwards',
            boxShadow: 'inset 0 2px 8px rgba(220,38,38,.1)',
          }}>
            <div style={{ marginBottom: '10px' }}>
              Anda belum membayar iuran bulan: <br />
              <b style={{
                color: '#991b1b', fontSize: '15px',
                padding: '4px 10px', backgroundColor: '#fff',
                borderRadius: '6px', display: 'inline-block', marginTop: '4px',
                borderLeft: '3px solid #dc2626',
              }}>
                {belum.join(', ')}
              </b>
            </div>
            <div style={{ marginBottom: '10px' }}>
              Total tagihan: <b style={{
                color: '#fff', fontSize: '18px', fontWeight: 900,
                padding: '6px 14px',
                background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                borderRadius: '8px', display: 'inline-block',
                boxShadow: '0 4px 12px rgba(220,38,38,.4)',
              }}>
                Rp {Number(profil.data.total * belum.length).toLocaleString('id-ID')}
              </b>
            </div>
            <div style={{ fontSize: '12px', paddingTop: '8px', borderTop: '1px dashed #fca5a5' }}>
              <b>SEGERA LAKUKAN PEMBAYARAN!</b> Transfer ke rekening BNI "1910250198" (Tia Agustina)
              atau cash ke Ruangan Subbagian Tata Usaha dan Keuangan di Lantai 2.
            </div>
          </div>

          <button
            onClick={() => setPopupDitutup(true)}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.08)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(220,38,38,.5)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(220,38,38,.4)'
            }}
            style={{
              marginTop: '22px', padding: '14px 36px',
              borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: '#fff',
              fontSize: '15px', fontWeight: 800, cursor: 'pointer',
              letterSpacing: '1px',
              boxShadow: '0 6px 20px rgba(220,38,38,.4)',
              animation: 'btnPulse 2s ease-in-out infinite',
              transition: 'all 0.3s ease',
            }}
          >
            <IkonHand size={16} /> SAYA MENGERTI
          </button>
        </div>
      </div>
    )

    return (
      <div style={{ ...pageStyle, backgroundImage: 'linear-gradient(rgba(245,248,252,.9), rgba(245,248,252,.94)), url(/kang-cepot.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <style>{`
          @keyframes popupZoomIn {
            0% { opacity: 0; transform: scale(0.3) rotate(-8deg); }
            50% { opacity: 1; transform: scale(1.1) rotate(2deg); }
            70% { transform: scale(0.95) rotate(-1deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
          @keyframes overlayFade {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes iconBounce {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-15px) rotate(-15deg); }
            50% { transform: translateY(0) rotate(15deg); }
            75% { transform: translateY(-8px) rotate(-8deg); }
          }
          @keyframes pulseRed {
            0%, 100% { box-shadow: 0 20px 50px rgba(220,38,38,.25), 0 0 0 0 rgba(220,38,38,.7); }
            50% { box-shadow: 0 20px 50px rgba(220,38,38,.5), 0 0 0 20px rgba(220,38,38,0); }
          }
          @keyframes numberShake {
            0%, 100% { transform: scale(1); }
            10%, 30%, 50%, 70%, 90% { transform: scale(1.15); }
            20%, 40%, 60%, 80% { transform: scale(0.95); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes btnPulse {
            0%, 100% { transform: scale(1); box-shadow: 0 4px 12px rgba(220,38,38,.3); }
            50% { transform: scale(1.05); box-shadow: 0 6px 20px rgba(220,38,38,.6); }
          }
        `}</style>

        {popupTagihan}

        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img src="/kang-cepot.png" alt="Kang Cepot" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #ffc72c', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
            <div>
              <h1 style={{ ...titleStyle, color: '#002b5c' }}>
                <IkonWallet size={26} style={{ color: '#16a34a' }} /> KANG CEPOT — Iuran Saya
              </h1>
              <p style={subtitleStyle}>Data iuran pribadi Anda tahun {profil?.tahun || tahunIni}.</p>
            </div>
          </div>
        </div>

        {profil === null ? (
          <div style={cardStyle}><div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}><IkonClock size={16} /> Memuat data iuran Anda...</div></div>
        ) : profil === false ? (
          <div style={cardStyle}>
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ marginBottom: '12px' }}>
                <IkonFolder size={44} style={{ color: '#94a3b8' }} />
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#172b4d', marginBottom: '8px' }}>Data Iuran Belum Terdaftar</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                NIP <b>{user.nip}</b> belum tercatat di sistem iuran. Hubungi Subbagian Tata Usaha & Keuangan untuk didaftarkan.
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={cardStyle}>
              <div style={sectionHeader}>
                <h2 style={sectionTitle}><IkonWallet size={17} /> Rincian Iuran Bulanan Anda</h2>
                <p style={sectionSubtitle}>{profil.data.nama} • NIP {profil.data.nip}</p>
              </div>
              <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                <div style={statBox}><div style={statLabel}>DPP</div><div style={statValue}>{formatTitik(Number(profil.data.dpp))}</div></div>
                <div style={statBox}><div style={statLabel}>BAPORS</div><div style={statValue}>{formatTitik(Number(profil.data.bapors))}</div></div>
                <div style={statBox}><div style={statLabel}>KEAGAMAAN</div><div style={statValue}>{formatTitik(Number(profil.data.keagamaan))}</div></div>
                <div style={{ ...statBox, border: '2px solid #dc2626', background: '#fee2e2' }}><div style={statLabel}>TOTAL / BULAN</div><div style={{ ...statValue, color: '#dc2626' }}>{formatTitik(Number(profil.data.total))}</div></div>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={sectionHeader}>
                <h2 style={sectionTitle}><IkonCalendar size={17} /> Status Bayar per Bulan</h2>
                <p style={sectionSubtitle}>Bulan <IkonX size={11} style={{ color: '#dc2626' }} /> = belum tercatat bayar. Hubungi Subbagian TU & Keuangan bila ada ketidaksesuaian.</p>
              </div>
              <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                {daftarBulan.map((b) => {
                  const st = bulananMap[b] === 'sudah'
                  return (
                    <div key={b} style={{ padding: '12px', borderRadius: '10px', border: st ? '2px solid #16a34a' : '2px solid #dc2626', backgroundColor: st ? '#dcfce7' : '#fee2e2', color: st ? '#166534' : '#991b1b', fontWeight: 700, fontSize: '13px', textAlign: 'center' }}>
                      {b}<br />{st ? <><IkonCheck size={12} /> SUDAH</> : <><IkonX size={12} /> BELUM</>}
                    </div>
                  )
                })}
              </div>
              {belum.length > 0 && (
                <div style={{ margin: '0 20px 20px', padding: '14px 18px', backgroundColor: '#fee2e2', border: '1px solid #dc2626', borderRadius: '10px', color: '#7f1d1d', fontSize: '13px', fontWeight: 600 }}>
                  <IkonAlert size={14} /> Anda belum bayar iuran bulan: <b>{belum.join(', ')}</b>. Mohon transfer ke rekening BNI "1910250198" (Tia Agustina) atau cash ke Ruangan Subbagian TU & Keuangan Lt. 2.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    )
  }

  // ===== ✨ TAMPILAN ADMIN (tidak diubah) =====
  if (!isAdmin) {
    return <div style={pageStyle}><IkonLock size={16} /> Halaman ini hanya dapat diakses oleh Admin Keuangan, Superadmin, dan Pegawai.</div>
  }

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const wb = XLSX.read(ev.target.result, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws)

      const hasil = []
      rows.forEach((r) => {
        const nip = String(cariKolom(r, 'NIP', 'nip')).trim()
        if (!nip) return
        const dpp = angka(cariKolom(r, 'DPP'))
        const bapors = angka(cariKolom(r, 'BAPORS', 'BAPOR'))
        const dkm = angka(cariKolom(r, 'DKM'))
        const pwk = angka(cariKolom(r, 'PWK'))
        hasil.push({
          nip,
          nama: String(cariKolom(r, 'NAMA', 'Nama', 'nama') || '').trim(),
          no_hp: String(cariKolom(r, 'NO HP', 'NOHP', 'NO_HP', 'WA', 'TELEPON') || '').trim(),
          dpp, bapors, keagamaan: dkm > 0 ? dkm : pwk,
        })
      })

      if (hasil.length > 0) {
        await fetch(API + '/iuran/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows: hasil }),
        })
        muatData()
      }
      setUploadInfo(`✅ ${hasil.length} baris diproses. Data lama dipertahankan, data sama di-update.`)
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  const tambahPegawai = async (e) => {
    e.preventDefault()
    const res = await fetch(API + '/iuran', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formTambah),
    })
    const json = await res.json()
    if (json.success) {
      setFormTambah({ nama: '', nip: '', no_hp: '', status_bayar: 'belum' })
      setShowForm(false)
      muatData()
    } else {
      alert(json.message || 'Gagal menambahkan pegawai.')
    }
  }

  const mulaiEdit = (d) => {
    setEditing(d)
    setFormEdit({
      nama: d.nama, no_hp: d.no_hp || '',
      dpp: formatTitik(d.dpp), bapors: formatTitik(d.bapors),
      keagamaan: formatTitik(d.keagamaan), status_bayar: d.status_bayar,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalEdit = angka(formEdit.dpp) + angka(formEdit.bapors) + angka(formEdit.keagamaan)

  const simpanEdit = async (e) => {
    e.preventDefault()
    if (!editing) return
    await fetch(API + '/iuran/' + editing.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nama: formEdit.nama, no_hp: formEdit.no_hp,
        dpp: angka(formEdit.dpp), bapors: angka(formEdit.bapors),
        keagamaan: angka(formEdit.keagamaan), status_bayar: formEdit.status_bayar,
      }),
    })
    setEditing(null)
    muatData()
  }

  const hapus = async (id) => {
    if (window.confirm('Yakin ingin menghapus data iuran ini?')) {
      await fetch(API + '/iuran/' + id, { method: 'DELETE' })
      muatData()
    }
  }

  const kirimWa = (d) => {
    if (!d.no_hp) { alert('Nomor HP pegawai ini belum diisi!'); return }
    if (d.total <= 0) { alert('Isi dulu nominal iuran lewat tombol Edit!'); return }
    window.open('https://wa.me/' + nomorWa(d.no_hp) + '?text=' + encodeURIComponent(buatPesan(d)), '_blank')
  }

  const bukaKelola = async (d) => {
    setKelola({ id: d.id, nama: d.nama, loading: true, bulan: {} })
    const res = await fetch(API + '/iuran/' + d.id + '/bulanan')
    const json = await res.json()
    const map = {}
    if (json.success) json.data.forEach((b) => { map[b.bulan] = b.status })
    setKelola({ id: d.id, nama: d.nama, loading: false, bulan: map })
  }

  // ✨ FIX 1: Optimistic update dengan functional state (fix race condition)
  const toggleBulan = async (bulan) => {
    const statusSekarang = kelola.bulan[bulan] || 'belum'
    const statusBaru = statusSekarang === 'sudah' ? 'belum' : 'sudah'

    // Update UI DULU dengan functional update (selalu pakai state TERBARU)
    setKelola((prev) => ({
      ...prev,
      bulan: { ...prev.bulan, [bulan]: statusBaru },
    }))

    try {
      const res = await fetch(API + '/iuran/' + kelola.id + '/bulanan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulan, status: statusBaru }),
      })

      // Rollback kalau server error
      if (!res.ok) {
        setKelola((prev) => ({
          ...prev,
          bulan: { ...prev.bulan, [bulan]: statusSekarang },
        }))
        alert('Gagal menyimpan status. Silakan coba lagi.')
      }
    } catch (err) {
      // Rollback kalau network error
      setKelola((prev) => ({
        ...prev,
        bulan: { ...prev.bulan, [bulan]: statusSekarang },
      }))
      alert('Koneksi gagal. Status dikembalikan ke semula.')
    }

    muatData()
  }

  const dataFiltered = data.filter((d) =>
    filterStatus === 'semua' || d.status_bayar === filterStatus
  )

  return (
    <div style={{ ...pageStyle, backgroundImage: 'linear-gradient(rgba(245,248,252,.88), rgba(245,248,252,.92)), url(/kang-cepot.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src="/kang-cepot.png" alt="Kang Cepot" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #ffc72c' }} />
          <div>
            <h1 style={{ ...titleStyle, color: '#002b5c' }}>
              <IkonWallet size={26} style={{ color: '#16a34a' }} /> KANG CEPOT
            </h1>
            <p style={subtitleStyle}>Tagihan iuran via WhatsApp + pantauan bayar per bulan (tahun {tahunIni}).</p>
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={sectionHeader}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={sectionTitle}><IkonUpload size={17} /> Upload Excel Iuran</h2>
              <p style={sectionSubtitle}>Kolom dibaca: NAMA | NIP | NO HP | DPP | BAPORS | DKM/PWK.</p>
            </div>
            <button onClick={() => setShowForm(!showForm)} style={btnTambah}>
              {showForm ? <><IkonX size={14} /> Tutup Form</> : <><IkonPlus size={14} /> Tambah Pegawai Baru</>}
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={tambahPegawai} style={{ padding: '20px', backgroundColor: '#fef9e7', borderBottom: '1px solid #fde68a' }}>
            <div style={formGrid}>
              <div><label style={labelStyle}>Nama</label><input type="text" required value={formTambah.nama} onChange={(e) => setFormTambah({ ...formTambah, nama: e.target.value })} style={inputStyle} /></div>
              <div><label style={labelStyle}>NIP</label><input type="text" required value={formTambah.nip} onChange={(e) => setFormTambah({ ...formTambah, nip: e.target.value })} style={inputStyle} /></div>
              <div><label style={labelStyle}>No HP (WA)</label><input type="text" required value={formTambah.no_hp} onChange={(e) => setFormTambah({ ...formTambah, no_hp: e.target.value })} style={inputStyle} /></div>
              <div>
                <label style={labelStyle}>Status Bayar</label>
                <select value={formTambah.status_bayar} onChange={(e) => setFormTambah({ ...formTambah, status_bayar: e.target.value })} style={inputStyle}>
                  <option value="belum">Belum Bayar</option>
                  <option value="sudah">Sudah Bayar</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button type="submit" style={btnSimpan}><IkonSave size={14} /> Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} style={btnBatal}>Batal</button>
            </div>
          </form>
        )}

        <div style={filterGrid}>
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} style={inputStyle} />
          {uploadInfo && <div style={{ ...infoStyle, marginBottom: 0 }}>{uploadInfo}</div>}
        </div>
      </div>

      {editing && (
        <div style={{ ...cardStyle, border: '2px solid #f59e0b', background: '#fef3c7' }}>
          <div style={sectionHeader}><h2 style={{ ...sectionTitle, color: '#92400e' }}><IkonPencil size={16} /> Edit Iuran: {editing.nama}</h2></div>
          <form onSubmit={simpanEdit} style={{ padding: '20px' }}>
            <div style={formGrid}>
              <div><label style={labelStyle}>Nama</label><input type="text" required value={formEdit.nama} onChange={(e) => setFormEdit({ ...formEdit, nama: e.target.value })} style={inputStyle} /></div>
              <div><label style={labelStyle}>No HP (WA)</label><input type="text" required value={formEdit.no_hp} onChange={(e) => setFormEdit({ ...formEdit, no_hp: e.target.value })} style={inputStyle} /></div>
              <div><label style={labelStyle}>DPP</label><input type="text" required value={formEdit.dpp} onChange={(e) => setFormEdit({ ...formEdit, dpp: formatTitik(angka(e.target.value)) })} style={inputStyle} /></div>
              <div><label style={labelStyle}>BAPORS</label><input type="text" required value={formEdit.bapors} onChange={(e) => setFormEdit({ ...formEdit, bapors: formatTitik(angka(e.target.value)) })} style={inputStyle} /></div>
              <div><label style={labelStyle}>KEAGAMAAN</label><input type="text" required value={formEdit.keagamaan} onChange={(e) => setFormEdit({ ...formEdit, keagamaan: formatTitik(angka(e.target.value)) })} style={inputStyle} /></div>
              <div>
                <label style={labelStyle}>Status Bayar</label>
                <select value={formEdit.status_bayar} onChange={(e) => setFormEdit({ ...formEdit, status_bayar: e.target.value })} style={inputStyle}>
                  <option value="belum">Belum Bayar</option>
                  <option value="sudah">Sudah Bayar</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: '16px', fontSize: '18px', fontWeight: 800, color: '#92400e' }}>TOTAL OTOMATIS: {formatTitik(totalEdit)}</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button type="submit" style={btnSimpan}><IkonSave size={14} /> Simpan</button>
              <button type="button" onClick={() => setEditing(null)} style={btnBatal}>Batal</button>
            </div>
          </form>
        </div>
      )}

      <div style={cardStyle}>
        <div style={sectionHeader}>
          <h2 style={sectionTitle}><IkonClipboard size={17} /> Daftar Iuran Pegawai</h2>
          <p style={sectionSubtitle}>
            <IkonCalendar size={12} /> Kelola = atur bayar per bulan. <IkonMessage size={12} /> WA = kirim tagihan otomatis.
          </p>
        </div>

        <div style={{ padding: '16px 20px 0', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}><IkonSearch size={14} /> Filter Status:</span>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
            <option value="semua">Semua</option>
            <option value="sudah">Sudah Bayar</option>
            <option value="belum">Belum Bayar</option>
          </select>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Menampilkan {dataFiltered.length} dari {data.length} pegawai</span>
        </div>

        <div style={{ overflowX: 'auto', padding: '16px 20px 20px' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>No</th>
                <th style={thStyle}>Nama</th>
                <th style={thStyle}>NIP</th>
                <th style={thStyle}>No HP / WA</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>DPP</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Bapors</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Keagamaan</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Total</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataFiltered.length === 0 ? (
                <tr><td colSpan="10" style={emptyStyle}><IkonUpload size={15} /> Tidak ada data. Upload Excel atau tambah pegawai manual.</td></tr>
              ) : (
                dataFiltered.map((d, i) => {
                  const siapWa = d.total > 0 && d.no_hp
                  return (
                    <tr key={d.id}>
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={tdStyle}><strong>{d.nama}</strong></td>
                      <td style={tdStyle}>{d.nip}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{d.no_hp || '—'}</span>
                          <button onClick={() => kirimWa(d)} disabled={!siapWa}
                            style={{ padding: '5px 10px', borderRadius: '8px', border: 'none', backgroundColor: siapWa ? '#25d366' : '#cbd5e1', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: siapWa ? 'pointer' : 'not-allowed', opacity: siapWa ? 1 : 0.6 }}>
                            <IkonMessage size={12} /> WA
                          </button>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>{formatTitik(d.dpp)}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>{formatTitik(d.bapors)}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>{formatTitik(d.keagamaan)}</td>
                      <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 800, color: '#dc2626' }}>{formatTitik(d.total)}</td>
                      <td style={tdStyle}>
                        <span style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, backgroundColor: d.status_bayar === 'sudah' ? '#dcfce7' : '#fee2e2', color: d.status_bayar === 'sudah' ? '#166534' : '#991b1b' }}>
                          {d.status_bayar === 'sudah' ? <><IkonCheck size={10} /> SUDAH</> : <><IkonX size={10} /> BELUM</>}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button onClick={() => bukaKelola(d)} style={btnKelola}><IkonCalendar size={11} /> Kelola</button>
                          <button onClick={() => mulaiEdit(d)} style={btnEdit}><IkonPencil size={11} /> Edit</button>
                          <button onClick={() => hapus(d.id)} style={btnHapus}><IkonTrash size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {kelola && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,31,69,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setKelola(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '680px', maxWidth: '94%', maxHeight: '85vh', overflowY: 'auto', background: '#fff', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 6px 0', color: '#002b5c', fontSize: '18px' }}>
              <IkonCalendar size={17} /> Kelola Iuran Bulanan — {kelola.nama}
            </h3>
            <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '13px' }}>Klik bulan untuk mengubah status sudah/belum bayar (tahun {tahunIni}).</p>
            {kelola.loading ? (
              <p style={{ textAlign: 'center', color: '#64748b' }}><IkonClock size={15} /> Memuat...</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                {daftarBulan.map((b) => {
                  const st = kelola.bulan[b] === 'sudah'
                  return (
                    <button
                      key={b}
                      onClick={() => toggleBulan(b)}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        border: st ? '2px solid #16a34a' : '2px solid #dc2626',
                        backgroundColor: st ? '#dcfce7' : '#fee2e2',
                        color: st ? '#166534' : '#991b1b',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: 'scale(1)',
                        boxShadow: st
                          ? '0 2px 6px rgba(22, 163, 74, 0.15)'
                          : '0 2px 6px rgba(220, 38, 38, 0.1)',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'scale(1.04)'
                        e.currentTarget.style.boxShadow = st
                          ? '0 4px 12px rgba(22, 163, 74, 0.3)'
                          : '0 4px 12px rgba(220, 38, 38, 0.25)'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.boxShadow = st
                          ? '0 2px 6px rgba(22, 163, 74, 0.15)'
                          : '0 2px 6px rgba(220, 38, 38, 0.1)'
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'scale(0.96)'
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = 'scale(1.04)'
                      }}
                    >
                      {b}<br />{st ? <><IkonCheck size={12} /> SUDAH</> : <><IkonX size={12} /> BELUM</>}
                    </button>
                  )
                })}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px' }}>
              <button onClick={() => setKelola(null)} style={btnBatal}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const pageStyle = { padding: '32px', minHeight: '100%', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }
const headerStyle = { marginBottom: '24px' }
const titleStyle = { margin: 0, fontSize: '30px', color: '#102a43' }
const subtitleStyle = { margin: '7px 0 0', color: '#64748b', fontSize: '15px' }
const cardStyle = { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '22px', boxShadow: '0 2px 8px rgba(15,23,42,.04)', overflow: 'hidden' }
const sectionHeader = { padding: '20px 22px', borderBottom: '1px solid #e2e8f0' }
const sectionTitle = { margin: 0, fontSize: '18px', color: '#172b4d' }
const sectionSubtitle = { margin: '5px 0 0', color: '#94a3b8', fontSize: '13px' }
const filterGrid = { display: 'grid', gridTemplateColumns: '1fr', gap: '15px', padding: '20px' }
const formGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }
const labelStyle = { display: 'block', marginBottom: '7px', color: '#334155', fontSize: '13px', fontWeight: 600 }
const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#fff', color: '#334155', fontSize: '13px' }
const tableStyle = { width: '100%', borderCollapse: 'collapse', minWidth: '1100px' }
const thStyle = { padding: '13px 15px', textAlign: 'left', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }
const tdStyle = { padding: '15px', color: '#64748b', fontSize: '13px', borderBottom: '1px solid #edf2f7' }
const emptyStyle = { padding: '50px', textAlign: 'center', color: '#94a3b8' }
const btnTambah = { padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#16a34a', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }
const btnSimpan = { padding: '10px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }
const btnBatal = { padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#334155', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }
const btnEdit = { padding: '6px 10px', borderRadius: '8px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }
const btnHapus = { padding: '6px 10px', borderRadius: '8px', border: '1px solid #f5c2c2', backgroundColor: '#fdecec', color: '#b91c1c', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }
const btnKelola = { padding: '6px 10px', borderRadius: '8px', border: '1px solid #fde68a', backgroundColor: '#fef3c7', color: '#92400e', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }
const infoStyle = { backgroundColor: '#dcfce7', color: '#166534', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }
const statBox = { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', textAlign: 'center' }
const statLabel = { fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }
const statValue = { fontSize: '18px', fontWeight: 800, color: '#172b4d' }

export default KangCepot