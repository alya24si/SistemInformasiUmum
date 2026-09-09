import { useState, useEffect, useRef, Fragment } from 'react'

const API = 'http://localhost:8000/api'
const daftarBidang = ['Umum', 'P2', 'KI', 'Pabean', 'Fasilitas']
const daftarBulan = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]
const bulanSingkat = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const tahunIni = new Date().getFullYear()
const daftarTahun = Array.from({ length: 6 }, (_, i) => tahunIni - 1 + i)

const formatRupiah = (angka) =>
  'Rp ' + Number(angka).toLocaleString('id-ID')

const formatTitik = (angka) => {
  const n = String(angka).replace(/[^\d]/g, '')
  return n.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

// persen terserap per kegiatan = realisasi ÷ target
const persenKegiatan = (k) =>
  k.target_anggaran > 0
    ? Math.min(100, Math.round((k.realisasi / k.target_anggaran) * 100))
    : 0

const hitungTarget = (p) =>
  (p.kegiatan || []).reduce((a, k) => a + k.target_anggaran, 0)

const hitungRealisasi = (p) =>
  (p.kegiatan || []).reduce((a, k) => a + k.realisasi, 0)

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

const IkonTarget = (p) => (
  <SvgIkon {...p}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </SvgIkon>
)

const IkonCheck = (p) => (
  <SvgIkon {...p}>
    <path d="M20 6 9 17l-5-5" />
  </SvgIkon>
)

const IkonChart = (p) => (
  <SvgIkon {...p}>
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </SvgIkon>
)

const IkonClipboard = (p) => (
  <SvgIkon {...p}>
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
  </SvgIkon>
)

const IkonEye = (p) => (
  <SvgIkon {...p}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
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

const IkonBuilding = (p) => (
  <SvgIkon {...p}>
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </SvgIkon>
)

const IkonPencil = (p) => (
  <SvgIkon {...p}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
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

const IkonTrash = (p) => (
  <SvgIkon {...p}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </SvgIkon>
)

const IkonX = (p) => (
  <SvgIkon {...p}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </SvgIkon>
)

const IkonPlay = (p) => (
  <SvgIkon {...p}>
    <polygon points="6 3 20 12 6 21 6 3" />
  </SvgIkon>
)

function ProgramKerja({ user }) {
  const isAdmin =
    user.role === 'admin_keuangan' ||
    user.role === 'superadmin'

  const [programs, setPrograms] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [editingKegiatan, setEditingKegiatan] = useState(null)
  const [editingProgram, setEditingProgram] = useState(null)
  const [filterTahun, setFilterTahun] = useState('semua')
  const [filterBidang, setFilterBidang] = useState('semua')
  const [currentPage, setCurrentPage] = useState(0)
  const [ringkasanPage, setRingkasanPage] = useState(0)
  const panelKelolaRef = useRef(null)
  const panelEditProgramRef = useRef(null)

  const [formProgram, setFormProgram] = useState({
    tahun: tahunIni,
    bidang: daftarBidang[0],
    program: '',
    deskripsi: '',
    target: '',
  })

  const [formEditProgram, setFormEditProgram] = useState({
    tahun: tahunIni,
    bidang: daftarBidang[0],
    program: '',
    deskripsi: '',
    target: '',
  })

  const [formKegiatan, setFormKegiatan] = useState({
    bulan: daftarBulan[0],
    target_anggaran: '',
    realisasi: '',
  })

  const muatData = async () => {
    const res = await fetch(API + '/program_kerja')
    const json = await res.json()
    if (json.success) {
      setPrograms(
        json.data.map((d) => ({
          ...d,
          tahun: Number(d.tahun),
          kegiatan: (d.kegiatan || []).map((k) => ({
            ...k,
            target_anggaran: Number(k.target_anggaran),
            realisasi: Number(k.realisasi),
          })),
        }))
      )
    }
  }

  useEffect(() => {
    muatData()
  }, [])

  const selectedProgram =
    programs.find((p) => p.id === selectedId) || null

  const milikUser = isAdmin
    ? programs
    : programs.filter((p) => p.bidang === user.bidang)

  const programsFiltered = milikUser.filter((p) => {
    const cocokTahun =
      filterTahun === 'semua' ||
      p.tahun === Number(filterTahun)
    const cocokBidang = isAdmin
      ? filterBidang === 'semua' || p.bidang === filterBidang
      : true
    return cocokTahun && cocokBidang
  })

  const totalProgram = milikUser.length
  const totalBidang = isAdmin
    ? new Set(milikUser.map((p) => p.bidang)).size
    : 1
  const totalKegiatan = milikUser.reduce(
    (acc, p) => acc + (p.kegiatan ? p.kegiatan.length : 0),
    0
  )
  const totalSelesai = milikUser.filter((p) => {
    const t = hitungTarget(p)
    const r = hitungRealisasi(p)
    return t > 0 && r >= t
  }).length

  const persenProgram = (p) => {
    if (!p.kegiatan || p.kegiatan.length === 0) return 0
    const total = p.kegiatan.reduce((acc, k) => acc + persenKegiatan(k), 0)
    return Math.round(total / 12)
  }

  const statusBadge = (persen) => {
    if (persen === 100) return { label: 'Selesai', cls: 'green' }
    if (persen > 0) return { label: persen + '%', cls: 'yellow' }
    return { label: 'Belum Mulai', cls: 'red' }
  }

  const warnaPersen = (persen) =>
    persen === 100 ? '#16a34a' : persen > 0 ? '#d97706' : '#94a3b8'

  const bukaKelola = (id) => {
    setSelectedId(id)
    setEditingKegiatan(null)
    setTimeout(() => {
      panelKelolaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const mulaiEditProgram = (p) => {
    setEditingProgram(p)
    setFormEditProgram({
      tahun: p.tahun,
      bidang: p.bidang,
      program: p.program,
      deskripsi: p.deskripsi || '',
      target: p.target,
    })
    setTimeout(() => {
      panelEditProgramRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const batalEditProgram = () => {
    setEditingProgram(null)
    setFormEditProgram({
      tahun: tahunIni,
      bidang: daftarBidang[0],
      program: '',
      deskripsi: '',
      target: '',
    })
  }

  const mulaiEdit = (k) => {
    setEditingKegiatan(k)
    setFormKegiatan({
      bulan: k.bulan,
      target_anggaran: formatTitik(k.target_anggaran),
      realisasi: formatTitik(k.realisasi),
    })
    window.scrollTo({ top: panelKelolaRef.current?.offsetTop - 20 || 0, behavior: 'smooth' })
  }

  const batalEdit = () => {
    setEditingKegiatan(null)
    setFormKegiatan({
      bulan: daftarBulan[0],
      target_anggaran: '',
      realisasi: '',
    })
  }

  const tambahProgram = async (e) => {
    e.preventDefault()
    await fetch(API + '/program_kerja', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tahun: Number(formProgram.tahun),
        bidang: formProgram.bidang,
        program: formProgram.program,
        deskripsi: formProgram.deskripsi,
        target: formProgram.target,
      }),
    })
    setFormProgram({
      tahun: tahunIni,
      bidang: daftarBidang[0],
      program: '',
      deskripsi: '',
      target: '',
    })
    muatData()
  }

  const updateProgram = async (e) => {
    e.preventDefault()
    if (!editingProgram) return

    await fetch(API + '/program_kerja/' + editingProgram.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tahun: Number(formEditProgram.tahun),
        bidang: formEditProgram.bidang,
        program: formEditProgram.program,
        deskripsi: formEditProgram.deskripsi,
        target: formEditProgram.target,
      }),
    })
    batalEditProgram()
    muatData()
  }

  const hapusProgram = async (id) => {
    if (
      window.confirm(
        'Yakin ingin menghapus program ini? Semua kegiatan bulanannya ikut terhapus.'
      )
    ) {
      await fetch(API + '/program_kerja/' + id, { method: 'DELETE' })
      setSelectedId(null)
      setEditingKegiatan(null)
      setEditingProgram(null)
      muatData()
    }
  }

  const simpanKegiatan = async (e) => {
    e.preventDefault()
    if (!selectedProgram) return

    const payload = {
      program_kerja_id: selectedProgram.id,
      bulan: formKegiatan.bulan,
      target_anggaran: Number(formKegiatan.target_anggaran.replace(/\./g, '')),
      realisasi: Number(formKegiatan.realisasi.replace(/\./g, '')),
    }

    if (editingKegiatan) {
      await fetch(API + '/kegiatan_program/' + editingKegiatan.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch(API + '/kegiatan_program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }

    setEditingKegiatan(null)
    setFormKegiatan({ bulan: daftarBulan[0], target_anggaran: '', realisasi: '' })
    muatData()
  }

  const hapusKegiatan = async (id) => {
    if (window.confirm('Yakin ingin menghapus kegiatan bulan ini?')) {
      await fetch(API + '/kegiatan_program/' + id, { method: 'DELETE' })
      if (editingKegiatan && editingKegiatan.id === id) batalEdit()
      muatData()
    }
  }

  // ✨ RINGKASAN: Target vs Terlaksana vs Selisih (Rupiah)
  const SectionRingkasan = () => {
    const totalTarget = programsFiltered.reduce((a, p) => a + hitungTarget(p), 0)
    const totalSudah = programsFiltered.reduce((a, p) => a + hitungRealisasi(p), 0)
    const totalSelisih = totalTarget - totalSudah

    const ITEMS = 5
    const totalPagesRingkasan = Math.ceil(programsFiltered.length / ITEMS)
    const ringkasanPaginated = programsFiltered.slice(
      ringkasanPage * ITEMS,
      ringkasanPage * ITEMS + ITEMS
    )

    return (
      <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
        <h3><IkonTarget size={16} /> Ringkasan Target vs Realisasi Anggaran</h3>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
          Total target anggaran yang direncanakan dibanding yang sudah terlaksana.
        </p>

        <div className="stats-grid" style={{ marginBottom: '16px' }}>
          <div className="stat-card">
            <div className="stat-icon">
              <IkonTarget size={22} style={{ color: '#005ca9' }} />
            </div>
            <div className="stat-info">
              <h4>Total Target</h4>
              <div className="stat-value" style={{ fontSize: '15px' }}>{formatRupiah(totalTarget)}</div>
              <div className="stat-desc">Anggaran direncanakan</div>
            </div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon">
              <IkonCheck size={22} style={{ color: '#15803d' }} />
            </div>
            <div className="stat-info">
              <h4>Sudah Terlaksana</h4>
              <div className="stat-value" style={{ fontSize: '15px' }}>{formatRupiah(totalSudah)}</div>
              <div className="stat-desc">Realisasi berjalan</div>
            </div>
          </div>
          <div className="stat-card gold">
            <div className="stat-icon">
              <IkonChart size={22} style={{ color: '#b45309' }} />
            </div>
            <div className="stat-info">
              <h4>Selisih</h4>
              <div className="stat-value" style={{ fontSize: '15px', color: totalSelisih > 0 ? '#d97706' : '#16a34a' }}>
                {formatRupiah(totalSelisih)}
              </div>
              <div className="stat-desc">
                {totalSelisih > 0 ? 'Belum terlaksana' : 'Semua terlaksana'}
              </div>
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Tahun</th>
                <th>Bidang</th>
                <th>Program Kerja</th>
                <th className="num">Target Anggaran</th>
                <th className="num">Sudah Terlaksana</th>
                <th className="num">Selisih</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {programsFiltered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                    Belum ada data program kerja.
                  </td>
                </tr>
              ) : (
                ringkasanPaginated.map((p) => {
                  const target = hitungTarget(p)
                  const sudah = hitungRealisasi(p)
                  const selisih = target - sudah
                  const kosong = target === 0
                  const selesai = !kosong && selisih <= 0
                  return (
                    <tr key={p.id}>
                      <td>{p.tahun}</td>
                      <td>{p.bidang}</td>
                      <td><strong>{p.program}</strong></td>
                      <td className="num">{formatRupiah(target)}</td>
                      <td className="num">{formatRupiah(sudah)}</td>
                      <td className="num">
                        <span style={{ color: selisih > 0 ? '#d97706' : '#16a34a', fontWeight: 700 }}>
                          {formatRupiah(selisih)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${kosong ? 'red' : selesai ? 'green' : 'yellow'}`}>
                          {kosong ? 'Belum Ada Kegiatan' : selesai ? 'Tercapai' : 'Berjalan'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPagesRingkasan > 1 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
            <button
              onClick={() => setRingkasanPage((prev) => Math.max(0, prev - 1))}
              disabled={ringkasanPage === 0}
              className="btn"
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: ringkasanPage === 0 ? 'not-allowed' : 'pointer', opacity: ringkasanPage === 0 ? 0.5 : 1, fontSize: '11px', fontWeight: 600 }}
            >
              Back
            </button>
            <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748b' }}>
              {ringkasanPage + 1} / {Math.max(1, totalPagesRingkasan)}
            </span>
            <button
              onClick={() => setRingkasanPage((prev) => (prev + 1 < totalPagesRingkasan ? prev + 1 : prev))}
              disabled={ringkasanPage + 1 >= totalPagesRingkasan}
              className="btn"
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: ringkasanPage + 1 >= totalPagesRingkasan ? 'not-allowed' : 'pointer', opacity: ringkasanPage + 1 >= totalPagesRingkasan ? 0.5 : 1, fontSize: '11px', fontWeight: 600 }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-title">
        <h1><IkonClipboard size={22} /> Monitoring Program Kerja</h1>
        <p>
          Program kerja dilaporkan di awal tahun, lalu target anggaran
          dan realisasi per bulan diperbarui secara berkala.
        </p>
      </div>

      {!isAdmin && (
        <div className="guest-note">
          <IkonEye size={15} /> Mode tamu: Anda hanya melihat data bidang <b>{user.bidang}</b>.
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <IkonClipboard size={22} style={{ color: '#005ca9' }} />
          </div>
          <div className="stat-info">
            <h4>Total Program</h4>
            <div className="stat-value">{totalProgram}</div>
            <div className="stat-desc">
              {isAdmin ? 'Program terdaftar' : `Bidang ${user.bidang}`}
            </div>
          </div>
        </div>
        <div className="stat-card gold">
          <div className="stat-icon">
            <IkonBuilding size={22} style={{ color: '#b45309' }} />
          </div>
          <div className="stat-info">
            <h4>Bidang Melapor</h4>
            <div className="stat-value">{totalBidang}</div>
            <div className="stat-desc">Dari 5 bidang</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">
            <IkonCalendar size={22} style={{ color: '#15803d' }} />
          </div>
          <div className="stat-info">
            <h4>Total Kegiatan</h4>
            <div className="stat-value">{totalKegiatan}</div>
            <div className="stat-desc">Aktivitas per bulan</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <IkonCheck size={22} style={{ color: '#005ca9' }} />
          </div>
          <div className="stat-info">
            <h4>Program Selesai</h4>
            <div className="stat-value">{totalSelesai}</div>
            <div className="stat-desc">Realisasi penuh</div>
          </div>
        </div>
      </div>

      {isAdmin && editingProgram && (
        <div ref={panelEditProgramRef} className="card" style={{ border: '2px solid #f59e0b', background: '#fef3c7' }}>
          <h3>
            <IkonPencil size={16} /> Edit Program: <span style={{ color: '#92400e' }}>{editingProgram.program}</span>
          </h3>
          <form onSubmit={updateProgram} style={{ marginTop: '12px' }}>
            <div className="form-row">
              <select value={formEditProgram.tahun} onChange={(e) => setFormEditProgram({ ...formEditProgram, tahun: e.target.value })}>
                {daftarTahun.map((t) => (<option key={t} value={t}>Tahun {t}</option>))}
              </select>
              <select value={formEditProgram.bidang} onChange={(e) => setFormEditProgram({ ...formEditProgram, bidang: e.target.value })}>
                {daftarBidang.map((b) => (<option key={b} value={b}>{b}</option>))}
              </select>
              <input type="text" placeholder="Nama program kerja" required value={formEditProgram.program} onChange={(e) => setFormEditProgram({ ...formEditProgram, program: e.target.value })} />
              <input type="text" placeholder="Deskripsi program" value={formEditProgram.deskripsi} onChange={(e) => setFormEditProgram({ ...formEditProgram, deskripsi: e.target.value })} />
              <input type="text" placeholder="Target (contoh: 4 Kegiatan)" required value={formEditProgram.target} onChange={(e) => setFormEditProgram({ ...formEditProgram, target: e.target.value })} />
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="submit" className="btn" style={{ background: '#f59e0b' }}>
                  <IkonSave size={13} /> Update
                </button>
                <button type="button" className="btn" onClick={batalEditProgram} style={{ background: '#e2e8f0', color: '#0f172a' }}>
                  <IkonX size={13} /> Batal
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {isAdmin && !editingProgram && (
        <div className="card">
          <h3><IkonPlus size={16} /> Lapor Program Kerja (Awal Tahun)</h3>
          <form onSubmit={tambahProgram} className="form-row">
            <select value={formProgram.tahun} onChange={(e) => setFormProgram({ ...formProgram, tahun: e.target.value })}>
              {daftarTahun.map((t) => (<option key={t} value={t}>Tahun {t}</option>))}
            </select>
            <select value={formProgram.bidang} onChange={(e) => setFormProgram({ ...formProgram, bidang: e.target.value })}>
              {daftarBidang.map((b) => (<option key={b} value={b}>{b}</option>))}
            </select>
            <input type="text" placeholder="Nama program kerja" required value={formProgram.program} onChange={(e) => setFormProgram({ ...formProgram, program: e.target.value })} />
            <input type="text" placeholder="Deskripsi program" value={formProgram.deskripsi} onChange={(e) => setFormProgram({ ...formProgram, deskripsi: e.target.value })} />
            <input type="text" placeholder="Target (contoh: 4 Kegiatan)" required value={formProgram.target} onChange={(e) => setFormProgram({ ...formProgram, target: e.target.value })} />
            <button type="submit" className="btn">Simpan</button>
          </form>
        </div>
      )}

      <div className="card">
        <h3><IkonClipboard size={16} /> Daftar Program Kerja & Kalender Realisasi</h3>
        <div className="filter-row">
          <select value={filterTahun} onChange={(e) => { setFilterTahun(e.target.value); setCurrentPage(0); setRingkasanPage(0) }}>
            <option value="semua">Semua Tahun</option>
            {daftarTahun.map((t) => (<option key={t} value={t}>Tahun {t}</option>))}
          </select>
          {isAdmin && (
            <select value={filterBidang} onChange={(e) => { setFilterBidang(e.target.value); setCurrentPage(0); setRingkasanPage(0) }}>
              <option value="semua">Semua Bidang</option>
              {daftarBidang.map((b) => (<option key={b} value={b}>{b}</option>))}
            </select>
          )}
        </div>
        <div className="filter-info">
          Menampilkan {programsFiltered.length} dari {milikUser.length} program
        </div>

        <div className="table-wrap">
          <table className="table" style={{ minWidth: '900px' }}>
            <thead>
              <tr>
                <th>Tahun</th>
                <th>Bidang</th>
                <th style={{ minWidth: '220px' }}>Program Kerja</th>
                <th>Target</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const ITEMS_PER_PAGE = 5
                const totalPages = Math.ceil(programsFiltered.length / ITEMS_PER_PAGE)
                const dataPaginated = programsFiltered.slice(currentPage * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE)

                return (
                  <>
                    {dataPaginated.map((p) => {
                      const persen = persenProgram(p)
                      const st = statusBadge(persen)
                      return (
                        <Fragment key={p.id}>
                          <tr>
                            <td>{p.tahun}</td>
                            <td>{p.bidang}</td>
                            <td>
                              <div style={{ fontWeight: 700 }}>{p.program}</div>
                              {p.deskripsi && (
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{p.deskripsi}</div>
                              )}
                            </td>
                            <td>{p.target}</td>
                            <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                            <td>
                              {isAdmin && (
                                <>
                                  <button className="btn" style={{ padding: '4px 8px', fontSize: '11px', marginRight: '4px' }} onClick={() => mulaiEditProgram(p)}>
                                    <IkonPencil size={11} /> Edit
                                  </button>
                                  <button className="btn" style={{ padding: '4px 8px', fontSize: '11px', marginRight: '4px' }} onClick={() => bukaKelola(p.id)}>
                                    <IkonPlay size={11} /> Kelola
                                  </button>
                                  <button className="btn-danger" onClick={() => hapusProgram(p.id)}>
                                    <IkonTrash size={12} />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                          <tr style={{ background: '#fbfdff' }}>
                            <td colSpan={6} style={{ padding: '10px 14px' }}>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {daftarBulan.map((bulan, i) => {
                                  const k = (p.kegiatan || []).find((x) => x.bulan === bulan)
                                  const prs = k ? persenKegiatan(k) : 0
                                  return (
                                    <div
                                      key={bulan}
                                      style={{
                                        minWidth: '92px',
                                        padding: '6px 8px',
                                        borderRadius: '8px',
                                        background: k ? '#eff6ff' : '#f8fafc',
                                        border: k ? '1px solid #bfdbfe' : '1px dashed #e2e8f0',
                                        textAlign: 'center',
                                      }}
                                    >
                                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>{bulanSingkat[i]}</div>
                                      {k ? (
                                        <>
                                          <div style={{ fontSize: '10px', color: '#64748b' }}>{formatRupiah(k.target_anggaran)}</div>
                                          <div style={{ fontSize: '11px', fontWeight: 800, color: warnaPersen(prs) }}>{prs}%</div>
                                        </>
                                      ) : (
                                        <div style={{ fontSize: '10px', color: '#cbd5e1' }}>–</div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </td>
                          </tr>
                        </Fragment>
                      )
                    })}
                  </>
                )
              })()}
            </tbody>
          </table>
        </div>

        {(() => {
          const ITEMS_PER_PAGE = 5
          const totalPages = Math.ceil(programsFiltered.length / ITEMS_PER_PAGE)
          return (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
              <button onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))} disabled={currentPage === 0} className="btn" style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: currentPage === 0 ? 'not-allowed' : 'pointer', opacity: currentPage === 0 ? 0.5 : 1, fontSize: '11px', fontWeight: 600 }}>Back</button>
              <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748b' }}>{currentPage + 1} / {Math.max(1, totalPages)}</span>
              <button onClick={() => setCurrentPage((prev) => (prev + 1 < totalPages ? prev + 1 : prev))} disabled={currentPage + 1 >= totalPages} className="btn" style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: currentPage + 1 >= totalPages ? 'not-allowed' : 'pointer', opacity: currentPage + 1 >= totalPages ? 0.5 : 1, fontSize: '11px', fontWeight: 600 }}>Next</button>
            </div>
          )
        })()}
      </div>

      {!selectedProgram && <SectionRingkasan />}

      {selectedProgram && (
        <div ref={panelKelolaRef} className="card" style={{ border: '2px solid #3b82f6' }}>
          <h3>
            <IkonCalendar size={16} /> Kegiatan Bulanan: <span style={{ color: '#3b82f6' }}>{selectedProgram.program}</span>
          </h3>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
            {selectedProgram.bidang} • {selectedProgram.tahun} • Target: {selectedProgram.target}
          </p>

          {isAdmin && (
            <form onSubmit={simpanKegiatan} style={{ marginBottom: '20px', padding: '16px', background: editingKegiatan ? '#fef3c7' : '#f8fafc', borderRadius: '10px', border: editingKegiatan ? '2px solid #f59e0b' : '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, marginBottom: '10px', color: editingKegiatan ? '#92400e' : '#0f172a' }}>
                {editingKegiatan ? <><IkonPencil size={14} /> Edit Kegiatan: {editingKegiatan.bulan}</> : <><IkonPlus size={14} /> Tambah Kegiatan Baru</>}
              </div>
              <div className="form-row">
                <select value={formKegiatan.bulan} onChange={(e) => setFormKegiatan({ ...formKegiatan, bulan: e.target.value })}>
                  {daftarBulan.map((b) => (<option key={b} value={b}>{b}</option>))}
                </select>
                <input
                  type="text"
                  placeholder="Target anggaran (contoh: 1.200.000)"
                  required
                  value={formKegiatan.target_anggaran}
                  onChange={(e) => {
                    const angka = e.target.value.replace(/[^\d]/g, '')
                    setFormKegiatan({ ...formKegiatan, target_anggaran: angka.replace(/\B(?=(\d{3})+(?!\d))/g, '.') })
                  }}
                />
                <input
                  type="text"
                  placeholder="Sudah terlaksana (contoh: 500.000)"
                  required
                  value={formKegiatan.realisasi}
                  onChange={(e) => {
                    const angka = e.target.value.replace(/[^\d]/g, '')
                    setFormKegiatan({ ...formKegiatan, realisasi: angka.replace(/\B(?=(\d{3})+(?!\d))/g, '.') })
                  }}
                />
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="submit" className="btn" style={{ background: editingKegiatan ? '#f59e0b' : undefined }}>
                    {editingKegiatan ? <><IkonSave size={13} /> Update</> : <><IkonPlus size={13} /> Tambah</>}
                  </button>
                  {editingKegiatan && (
                    <button type="button" className="btn" onClick={batalEdit} style={{ background: '#e2e8f0', color: '#0f172a' }}>
                      <IkonX size={13} /> Batal
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Bulan</th>
                  <th>Target Anggaran</th>
                  <th>Sudah Terlaksana</th>
                  <th>Selisih</th>
                  <th>Realisasi</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {selectedProgram.kegiatan && selectedProgram.kegiatan.length > 0 ? (
                  selectedProgram.kegiatan.map((k) => {
                    const selisih = k.target_anggaran - k.realisasi
                    const prs = persenKegiatan(k)
                    return (
                      <tr key={k.id} style={{ background: editingKegiatan && editingKegiatan.id === k.id ? '#fef3c7' : undefined }}>
                        <td><strong>{k.bulan}</strong></td>
                        <td>{formatRupiah(k.target_anggaran)}</td>
                        <td>{formatRupiah(k.realisasi)}</td>
                        <td>
                          <span style={{ color: selisih > 0 ? '#d97706' : '#16a34a', fontWeight: 700 }}>
                            {formatRupiah(selisih)}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: warnaPersen(prs) }}>{prs}%</span>
                        </td>
                        <td>
                          {isAdmin && (
                            <>
                              <button className="btn" onClick={() => mulaiEdit(k)} style={{ padding: '4px 8px', fontSize: '11px', marginRight: '4px' }}>
                                <IkonPencil size={11} /> Edit
                              </button>
                              <button className="btn-danger" onClick={() => hapusKegiatan(k.id)}>
                                <IkonTrash size={12} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                      Belum ada kegiatan. Tambahkan kegiatan per bulan di atas!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <button className="btn" style={{ marginTop: '16px' }} onClick={() => { setSelectedId(null); setEditingKegiatan(null) }}>
            <IkonX size={13} /> Tutup
          </button>
        </div>
      )}

      {selectedProgram && <SectionRingkasan />}
    </div>
  )
}

export default ProgramKerja