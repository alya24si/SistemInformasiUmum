import { useState } from 'react'

const daftarBidang = ['Keuangan', 'Umum & Kepegawaian', 'Rumah Tangga']
const daftarTriwulan = ['TW1', 'TW2', 'TW3', 'TW4']
const daftarTahun = [2025, 2026, 2027]

const dataAwal = [
  {
    id: 1,
    tahun: 2026,
    bidang: 'Keuangan',
    program: 'Digitalisasi Laporan Anggaran',
    target: '12 Laporan',
    realisasi: { TW1: 25, TW2: 50, TW3: 0, TW4: 0 },
  },
  {
    id: 2,
    tahun: 2026,
    bidang: 'Umum & Kepegawaian',
    program: 'Penilaian Kinerja Pegawai',
    target: '4 Triwulan',
    realisasi: { TW1: 100, TW2: 0, TW3: 0, TW4: 0 },
  },
  {
    id: 3,
    tahun: 2026,
    bidang: 'Rumah Tangga',
    program: 'Penataan Arsip & Ruang Rapat',
    target: '8 Kegiatan',
    realisasi: { TW1: 0, TW2: 0, TW3: 0, TW4: 0 },
  },
]

const statusProgram = (p) => {
  const tertinggi = Math.max(...Object.values(p.realisasi))
  if (tertinggi >= 70) return { label: 'On Track', cls: 'green' }
  if (tertinggi >= 25) return { label: 'Berjalan', cls: 'yellow' }
  return { label: 'Perlu Atensi', cls: 'red' }
}

function ProgramKerja() {
  const [programs, setPrograms] = useState(dataAwal)
  const [formProgram, setFormProgram] = useState({
    tahun: 2026,
    bidang: daftarBidang[0],
    program: '',
    target: '',
  })
  const [formRealisasi, setFormRealisasi] = useState({ id: '', triwulan: 'TW1', persen: '' })

  const totalProgram = programs.length
  const totalBidang = new Set(programs.map((p) => p.bidang)).size
  const semuaTW = programs.flatMap((p) => Object.values(p.realisasi))
  const rataRealisasi = semuaTW.length
    ? Math.round(semuaTW.reduce((a, b) => a + b, 0) / semuaTW.length)
    : 0

  const tambahProgram = (e) => {
    e.preventDefault()
    const baru = {
      id: Date.now(),
      tahun: Number(formProgram.tahun),
      bidang: formProgram.bidang,
      program: formProgram.program,
      target: formProgram.target,
      realisasi: { TW1: 0, TW2: 0, TW3: 0, TW4: 0 },
    }
    setPrograms([...programs, baru])
    setFormProgram({ tahun: 2026, bidang: daftarBidang[0], program: '', target: '' })
  }

  const updateRealisasi = (e) => {
    e.preventDefault()
    setPrograms(
      programs.map((p) =>
        p.id === Number(formRealisasi.id)
          ? {
              ...p,
              realisasi: {
                ...p.realisasi,
                [formRealisasi.triwulan]: Number(formRealisasi.persen),
              },
            }
          : p
      )
    )
    setFormRealisasi({ id: '', triwulan: 'TW1', persen: '' })
  }

  return (
    <div className="page">
      <div className="page-title">
        <h1>📋 Monitoring Program Kerja</h1>
        <p>Setiap bidang melaporkan program kerja tahunan di awal tahun, dan update realisasi setiap triwulan.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h4>Total Program</h4>
            <div className="stat-value">{totalProgram}</div>
            <div className="stat-desc">Program kerja terdaftar</div>
          </div>
        </div>
        <div className="stat-card gold">
          <div className="stat-icon">🏢</div>
          <div className="stat-info">
            <h4>Bidang Melapor</h4>
            <div className="stat-value">{totalBidang}</div>
            <div className="stat-desc">Dari 3 bidang</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <h4>Rata-rata Realisasi</h4>
            <div className="stat-value">{rataRealisasi}%</div>
            <div className="stat-desc">Seluruh triwulan</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>➕ Lapor Program Kerja (Awal Tahun)</h3>
        <form onSubmit={tambahProgram} className="form-row">
          <select value={formProgram.tahun} onChange={(e) => setFormProgram({ ...formProgram, tahun: e.target.value })}>
            {daftarTahun.map((t) => <option key={t} value={t}>Tahun {t}</option>)}
          </select>
          <select value={formProgram.bidang} onChange={(e) => setFormProgram({ ...formProgram, bidang: e.target.value })}>
            {daftarBidang.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <input type="text" placeholder="Nama program kerja" required
            value={formProgram.program} onChange={(e) => setFormProgram({ ...formProgram, program: e.target.value })} />
          <input type="text" placeholder="Target (contoh: 12 Laporan)" required
            value={formProgram.target} onChange={(e) => setFormProgram({ ...formProgram, target: e.target.value })} />
          <button type="submit" className="btn">Simpan</button>
        </form>
      </div>

      <div className="card">
        <h3>📈 Update Realisasi Triwulan</h3>
        <form onSubmit={updateRealisasi} className="form-row">
          <select value={formRealisasi.id} required
            onChange={(e) => setFormRealisasi({ ...formRealisasi, id: e.target.value })}>
            <option value="">-- Pilih Program --</option>
            {programs.map((p) => <option key={p.id} value={p.id}>{p.tahun} | {p.bidang} | {p.program}</option>)}
          </select>
          <select value={formRealisasi.triwulan} onChange={(e) => setFormRealisasi({ ...formRealisasi, triwulan: e.target.value })}>
            {daftarTriwulan.map((tw) => <option key={tw} value={tw}>{tw}</option>)}
          </select>
          <input type="number" min="0" max="100" placeholder="Persen (%)" required
            value={formRealisasi.persen} onChange={(e) => setFormRealisasi({ ...formRealisasi, persen: e.target.value })} />
          <button type="submit" className="btn">Update</button>
        </form>
      </div>

      <div className="card">
        <h3>📋 Daftar Program Kerja & Realisasi</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Tahun</th>
              <th>Bidang</th>
              <th>Program Kerja</th>
              <th>Target</th>
              <th>TW I</th>
              <th>TW II</th>
              <th>TW III</th>
              <th>TW IV</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((p) => {
              const st = statusProgram(p)
              return (
                <tr key={p.id}>
                  <td>{p.tahun}</td>
                  <td>{p.bidang}</td>
                  <td>{p.program}</td>
                  <td>{p.target}</td>
                  <td>{p.realisasi.TW1}%</td>
                  <td>{p.realisasi.TW2}%</td>
                  <td>{p.realisasi.TW3}%</td>
                  <td>{p.realisasi.TW4}%</td>
                  <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ProgramKerja