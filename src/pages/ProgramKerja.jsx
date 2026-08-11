import { useState } from 'react'

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
  const isAdmin = user.role === 'admin'
  const [programs, setPrograms] = useState(dataAwal)
  const [formProgram, setFormProgram] = useState({ tahun: tahunIni, bidang: daftarBidang[0], program: '', target: '' })
  const [formRealisasi, setFormRealisasi] = useState({ id: '', triwulan: 'TW1', status: '100' })
  const [filterTahun, setFilterTahun] = useState('semua')
  const [filterBidang, setFilterBidang] = useState('semua')

  const milikUser = isAdmin ? programs : programs.filter((p) => p.bidang === user.bidang)

  const programsFiltered = milikUser.filter((p) => {
    const cocokTahun = filterTahun === 'semua' || p.tahun === Number(filterTahun)
    const cocokBidang = isAdmin ? (filterBidang === 'semua' || p.bidang === filterBidang) : true
    return cocokTahun && cocokBidang
  })

  const totalProgram = milikUser.length
  const totalBidang = isAdmin ? new Set(programs.map((p) => p.bidang)).size : 1
  const totalSelesai = milikUser.filter((p) => Object.values(p.realisasi).every((v) => v === 100)).length

  const tambahProgram = (e) => {
    e.preventDefault()
    const baru = { id: Date.now(), tahun: Number(formProgram.tahun), bidang: formProgram.bidang, program: formProgram.program, target: formProgram.target, realisasi: { TW1: 0, TW2: 0, TW3: 0, TW4: 0 } }
    setPrograms([...programs, baru])
    setFormProgram({ tahun: tahunIni, bidang: daftarBidang[0], program: '', target: '' })
  }

  const updateRealisasi = (e) => {
    e.preventDefault()
    setPrograms(programs.map((p) => p.id === Number(formRealisasi.id) ? { ...p, realisasi: { ...p.realisasi, [formRealisasi.triwulan]: Number(formRealisasi.status) } } : p))
    setFormRealisasi({ id: '', triwulan: 'TW1', status: '100' })
  }

  const hapusProgram = (id) => {
    if (window.confirm('Yakin ingin menghapus program kerja ini?')) setPrograms(programs.filter((p) => p.id !== id))
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
              {programsFiltered.map((p) => {
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ProgramKerja