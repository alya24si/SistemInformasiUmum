import { useState, useEffect } from 'react'

const API = 'http://localhost:8000/api'
const daftarBidang = ['Umum', 'P2', 'KI', 'Pabean', 'Fasilitas']
const daftarTriwulan = ['TW1', 'TW2', 'TW3', 'TW4']
const tahunIni = new Date().getFullYear()
const daftarTahun = Array.from({ length: 6 }, (_, i) => tahunIni - 1 + i)

const dataAwal = [
  { id: 1, tahun: 2026, bidang: 'P2', program: 'Sosialisasi dan Penyuluhan (Eksternal)', target: '4 Kegiatan', realisasi: { TW1: 100, TW2: 100, TW3: 0, TW4: 0 } },
  { id: 2, tahun: 2026, bidang: 'Umum', program: 'Penilaian Kinerja Pegawai', target: '4 Triwulan', realisasi: { TW1: 100, TW2: 100, TW3: 100, TW4: 100 } },
  { id: 3, tahun: 2026, bidang: 'Fasilitas', program: 'Penataan Arsip & Ruang Rapat', target: '8 Kegiatan', realisasi: { TW1: 0, TW2: 0, TW3: 0, TW4: 0 } },
  { id: 4, tahun: 2026, bidang: 'KI', program: 'Pemeriksaan Kepabeanan dan Cukai', target: '5 Laporan', realisasi: { TW1: 100, TW2: 0, TW3: 0, TW4: 0 } },
]

const statusProgram = (p) => {
  const selesai = Object.values(p.realisasi).every((v) => v === 100)
  return selesai ? { label: 'Selesai', cls: 'green' } : { label: 'Belum Selesai', cls: 'yellow' }
}

function ProgramKerja({ user }) {
  const isAdmin = user.role === 'admin_keuangan' || user.role === 'superadmin'
  const [programs, setPrograms] = useState([])

  const muatData = async () => {
    const res = await fetch(API + '/program_kerja')
    const json = await res.json()
    if (json.success) {
      setPrograms(
        json.data.map((d) => ({
          ...d,
          tahun: Number(d.tahun),
          realisasi: {
            TW1: Number(d.realisasi_tw1),
            TW2: Number(d.realisasi_tw2),
            TW3: Number(d.realisasi_tw3),
            TW4: Number(d.realisasi_tw4),
          },
        }))
      )
    }
  }

  useEffect(() => {
    muatData()
  }, [])
  const [formProgram, setFormProgram] = useState({ tahun: tahunIni, bidang: daftarBidang[0], program: '', target: '' })
  const [formRealisasi, setFormRealisasi] = useState({ id: '', triwulan: 'TW1', status: '100' })
  const [filterTahun, setFilterTahun] = useState('semua')
  const [filterBidang, setFilterBidang] = useState('semua')
  const [currentPage, setCurrentPage] = useState(0)

  const milikUser = isAdmin ? programs : programs.filter((p) => p.bidang === user.bidang)

  const programsFiltered = milikUser.filter((p) => {
    const cocokTahun = filterTahun === 'semua' || p.tahun === Number(filterTahun)
    const cocokBidang = isAdmin ? (filterBidang === 'semua' || p.bidang === filterBidang) : true
    return cocokTahun && cocokBidang
  })

  const totalProgram = milikUser.length
  const totalBidang = isAdmin ? new Set(programs.map((p) => p.bidang)).size : 1
  const totalSelesai = milikUser.filter((p) => Object.values(p.realisasi).every((v) => v === 100)).length

  const tambahProgram = async (e) => {
    e.preventDefault()
    await fetch(API + '/program_kerja', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tahun: Number(formProgram.tahun),
        bidang: formProgram.bidang,
        program: formProgram.program,
        target: formProgram.target,
      }),
    })
    setFormProgram({ tahun: tahunIni, bidang: daftarBidang[0], program: '', target: '' })
    muatData()
  }

  const updateRealisasi = async (e) => {
    e.preventDefault()
    await fetch(API + '/program_kerja/' + formRealisasi.id + '/realisasi', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        triwulan: formRealisasi.triwulan,
        status: Number(formRealisasi.status),
      }),
    })
    setFormRealisasi({ id: '', triwulan: 'TW1', status: '100' })
    muatData()
  }

  const hapusProgram = async (id) => {
    if (window.confirm('Yakin ingin menghapus program kerja ini?')) {
      await fetch(API + '/program_kerja/' + id, { method: 'DELETE' })
      muatData()
    }
  }

  const cellTW = (nilai) => nilai === 100 ? <span className="tw-done">✔ 100%</span> : <span className="tw-not">✘ 0%</span>

  return (
    <div className="page">
      <div className="page-title">
        <h1>📋 Monitoring Program Kerja</h1>
        <p>Setiap bidang melaporkan program kerja tahunan di awal tahun, dan update realisasi setiap triwulan.</p>
      </div>

      {!isAdmin && <div className="guest-note">👁️ Mode tamu: Anda hanya melihat data bidang <b>{user.bidang}</b>.</div>}

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon">📋</div><div className="stat-info"><h4>Total Program</h4><div className="stat-value">{totalProgram}</div><div className="stat-desc">{isAdmin ? 'Program kerja terdaftar' : `Program bidang ${user.bidang}`}</div></div></div>
        <div className="stat-card gold"><div className="stat-icon">🏢</div><div className="stat-info"><h4>Bidang Melapor</h4><div className="stat-value">{totalBidang}</div><div className="stat-desc">Dari 5 bidang</div></div></div>
        <div className="stat-card green"><div className="stat-icon">✅</div><div className="stat-info"><h4>Program Selesai</h4><div className="stat-value">{totalSelesai}</div><div className="stat-desc">Realisasi penuh 4 triwulan</div></div></div>
      </div>

      {isAdmin && (<>
        <div className="card">
          <h3>➕ Lapor Program Kerja (Awal Tahun)</h3>
          <form onSubmit={tambahProgram} className="form-row">
            <select value={formProgram.tahun} onChange={(e) => setFormProgram({ ...formProgram, tahun: e.target.value })}>{daftarTahun.map((t) => <option key={t} value={t}>Tahun {t}</option>)}</select>
            <select value={formProgram.bidang} onChange={(e) => setFormProgram({ ...formProgram, bidang: e.target.value })}>{daftarBidang.map((b) => <option key={b} value={b}>{b}</option>)}</select>
            <input type="text" placeholder="Nama program kerja" required value={formProgram.program} onChange={(e) => setFormProgram({ ...formProgram, program: e.target.value })} />
            <input type="text" placeholder="Target (contoh: 4 Kegiatan)" required value={formProgram.target} onChange={(e) => setFormProgram({ ...formProgram, target: e.target.value })} />
            <button type="submit" className="btn">Simpan</button>
          </form>
        </div>

        <div className="card">
          <h3>📈 Update Realisasi Triwulan (Selesai / Belum)</h3>
          <form onSubmit={updateRealisasi} className="form-row">
            <select value={formRealisasi.id} required onChange={(e) => setFormRealisasi({ ...formRealisasi, id: e.target.value })}>
              <option value="">-- Pilih Program --</option>
              {programs.map((p) => <option key={p.id} value={p.id}>{p.tahun} | {p.bidang} | {p.program}</option>)}
            </select>
            <select value={formRealisasi.triwulan} onChange={(e) => setFormRealisasi({ ...formRealisasi, triwulan: e.target.value })}>{daftarTriwulan.map((tw) => <option key={tw} value={tw}>{tw}</option>)}</select>
            <select value={formRealisasi.status} onChange={(e) => setFormRealisasi({ ...formRealisasi, status: e.target.value })}>
              <option value="100">Selesai (100%)</option>
              <option value="0">Belum Selesai (0%)</option>
            </select>
            <button type="submit" className="btn">Update</button>
          </form>
        </div>
      </>)}

      <div className="card">
        <h3>📋 Daftar Program Kerja & Realisasi</h3>
        <div className="filter-row">
          <select value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)}>
            <option value="semua">Semua Tahun</option>
            {daftarTahun.map((t) => <option key={t} value={t}>Tahun {t}</option>)}
          </select>
          {isAdmin && (
            <select value={filterBidang} onChange={(e) => setFilterBidang(e.target.value)}>
              <option value="semua">Semua Bidang</option>
              {daftarBidang.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          )}
        </div>
        <div className="filter-info">Menampilkan {programsFiltered.length} dari {milikUser.length} program</div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Tahun</th><th>Bidang</th><th>Program Kerja</th><th>Target</th><th>TW I</th><th>TW II</th><th>TW III</th><th>TW IV</th><th>Status</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {(() => {
                const ITEMS_PER_PAGE = 10
                const totalPages = Math.ceil(programsFiltered.length / ITEMS_PER_PAGE)
                const startIndex = currentPage * ITEMS_PER_PAGE
                const endIndex = startIndex + ITEMS_PER_PAGE
                const dataPaginated = programsFiltered.slice(startIndex, endIndex)

                return (
                  <>
                    {dataPaginated.map((p) => {
                      const st = statusProgram(p)
                      return (
                        <tr key={p.id}>
                          <td>{p.tahun}</td><td>{p.bidang}</td><td>{p.program}</td><td>{p.target}</td>
                          <td>{cellTW(p.realisasi.TW1)}</td><td>{cellTW(p.realisasi.TW2)}</td><td>{cellTW(p.realisasi.TW3)}</td><td>{cellTW(p.realisasi.TW4)}</td>
                          <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                          <td>{isAdmin && <button className="btn-danger" onClick={() => hapusProgram(p.id)}>🗑</button>}</td>
                        </tr>
                      )
                    })}
                  </>
                )
              })()}
            </tbody>
          </table>
        </div>

        {(() => {
          const ITEMS_PER_PAGE = 10
          const totalPages = Math.ceil(programsFiltered.length / ITEMS_PER_PAGE)
          return (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="btn"
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: currentPage === 0 ? 'not-allowed' : 'pointer', opacity: currentPage === 0 ? 0.5 : 1, fontSize: '11px', fontWeight: 600 }}
              >
                Back
              </button>
              <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748b' }}>
                {currentPage + 1} / {Math.max(1, totalPages)}
              </span>
              <button
                onClick={() => setCurrentPage(prev => (prev + 1 < totalPages ? prev + 1 : prev))}
                disabled={currentPage + 1 >= totalPages}
                className="btn"
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: currentPage + 1 >= totalPages ? 'not-allowed' : 'pointer', opacity: currentPage + 1 >= totalPages ? 0.5 : 1, fontSize: '11px', fontWeight: 600 }}
              >
                Next
              </button>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

export default ProgramKerja