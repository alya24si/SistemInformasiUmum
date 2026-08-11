import { useState } from 'react'

const daftarBidang = ['Keuangan', 'Umum & Kepegawaian', 'Rumah Tangga']
const daftarBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const formatRupiah = (angka) => 'Rp ' + angka.toLocaleString('id-ID')

const dataAwal = [
  { id: 1, bidang: 'Keuangan', bulan: 'Maret', pagu: 400000000, realisasi: 300000000 },
  { id: 2, bidang: 'Umum & Kepegawaian', bulan: 'Maret', pagu: 500000000, realisasi: 210000000 },
  { id: 3, bidang: 'Rumah Tangga', bulan: 'Maret', pagu: 300000000, realisasi: 45000000 },
]

const statusAnggaran = (persen) => {
  if (persen >= 60) return { label: 'Aman', cls: 'green' }
  if (persen >= 25) return { label: 'Waspada', cls: 'yellow' }
  return { label: 'Kritis', cls: 'red' }
}

function Anggaran() {
  const [data, setData] = useState(dataAwal)
  const [form, setForm] = useState({ bidang: daftarBidang[0], bulan: daftarBulan[0], pagu: '', realisasi: '' })

  const totalPagu = data.reduce((a, b) => a + b.pagu, 0)
  const totalRealisasi = data.reduce((a, b) => a + b.realisasi, 0)
  const persenTotal = totalPagu > 0 ? Math.round((totalRealisasi / totalPagu) * 100) : 0

  const tambahData = (e) => {
    e.preventDefault()
    const baru = {
      id: Date.now(),
      bidang: form.bidang,
      bulan: form.bulan,
      pagu: Number(form.pagu),
      realisasi: Number(form.realisasi),
    }
    setData([...data, baru])
    setForm({ bidang: daftarBidang[0], bulan: daftarBulan[0], pagu: '', realisasi: '' })
  }

  return (
    <div className="page">
      <div className="page-title">
        <h1>💰 Penyerapan Anggaran</h1>
        <p>Data disajikan oleh bagian keuangan dan diperbarui setiap awal bulan.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏦</div>
          <div className="stat-info">
            <h4>Total Pagu</h4>
            <div className="stat-value" style={{ fontSize: '16px' }}>{formatRupiah(totalPagu)}</div>
            <div className="stat-desc">Seluruh bidang</div>
          </div>
        </div>
        <div className="stat-card gold">
          <div className="stat-icon">💵</div>
          <div className="stat-info">
            <h4>Total Realisasi</h4>
            <div className="stat-value" style={{ fontSize: '16px' }}>{formatRupiah(totalRealisasi)}</div>
            <div className="stat-desc">Sudah terserap</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h4>Penyerapan</h4>
            <div className="stat-value">{persenTotal}%</div>
            <div className="stat-desc">Dari total pagu</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>➕ Input Penyerapan Bulan Ini</h3>
        <form onSubmit={tambahData} className="form-row">
          <select value={form.bidang} onChange={(e) => setForm({ ...form, bidang: e.target.value })}>
            {daftarBidang.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={form.bulan} onChange={(e) => setForm({ ...form, bulan: e.target.value })}>
            {daftarBulan.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <input type="number" placeholder="Pagu anggaran (Rp)" required
            value={form.pagu} onChange={(e) => setForm({ ...form, pagu: e.target.value })} />
          <input type="number" placeholder="Realisasi (Rp)" required
            value={form.realisasi} onChange={(e) => setForm({ ...form, realisasi: e.target.value })} />
          <button type="submit" className="btn">Simpan</button>
        </form>
      </div>

      <div className="card">
        <h3>💰 Rekapitulasi Penyerapan Anggaran</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Bidang</th>
              <th>Bulan</th>
              <th>Pagu Anggaran</th>
              <th>Realisasi</th>
              <th>Penyerapan</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => {
              const persen = d.pagu > 0 ? Math.round((d.realisasi / d.pagu) * 100) : 0
              const st = statusAnggaran(persen)
              return (
                <tr key={d.id}>
                  <td>{d.bidang}</td>
                  <td>{d.bulan}</td>
                  <td>{formatRupiah(d.pagu)}</td>
                  <td>{formatRupiah(d.realisasi)}</td>
                  <td>
                    <div className="progress">
                      <div className="progress-bar" style={{ width: persen + '%' }}></div>
                    </div>
                    <small>{persen}%</small>
                  </td>
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

export default Anggaran