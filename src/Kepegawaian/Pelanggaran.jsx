import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { api } from '../api'

/* ========================================================= */
/* ✨ KONVERSI WAKTU: input dalam MENIT                       */
/*    1 hari kerja = 8.5 jam = 510 menit                     */
/* ========================================================= */
const MENIT_PER_HARI = 510

const menitKeHari = (menit) => menit / MENIT_PER_HARI
const bulatkan2 = (n) => Math.round(n * 100) / 100

const formatDurasi = (menit) => {
  const hari = Math.floor(menit / MENIT_PER_HARI)
  const sisa = menit - hari * MENIT_PER_HARI
  const jam = Math.floor(sisa / 60)
  const mnt = sisa % 60
  const bagian = []
  if (hari > 0) bagian.push(`${hari} hari`)
  if (jam > 0) bagian.push(`${jam} jam`)
  if (mnt > 0 || bagian.length === 0) bagian.push(`${mnt} menit`)
  return bagian.join(' ')
}

/* ========================================================= */
/* ✨ BATAS WARNING (dalam HARI KERJA)                        */
/*    3 hari  -> teguran lisan          (WARNING 1)          */
/*    4 hari+ -> teguran tertulis /     (WARNING 2)          */
/* ========================================================= */
const BATAS_WARNING1 = 3
const BATAS_WARNING2 = 4

const kalimatSanksi = (hari) => {
  if (hari >= 7)
    return 'Pernyataan tidak puas secara tertulis bagi PNS yang tidak Masuk Kerja tanpa alasan yang sah secara kumulatif selama 7 (tujuh) sampai dengan 10 (sepuluh) hari kerja dalam 1 (satu) tahun.'
  if (hari >= 4)
    return 'Teguran tertulis bagi PNS yang tidak Masuk Kerja tanpa alasan yang sah secara kumulatif selama 4 (empat) sampai dengan 6 (enam) hari kerja dalam 1 (satu) tahun.'
  return 'Teguran lisan bagi PNS yang tidak Masuk Kerja tanpa alasan yang sah secara kumulatif selama 3 (tiga) hari kerja dalam 1 (satu) tahun.'
}

const cariKolom = (row, ...kemungkinan) => {
  for (const key of Object.keys(row)) {
    const k = key.toLowerCase().replace(/\s+/g, '')
    for (const nama of kemungkinan) {
      if (k === nama.toLowerCase().replace(/\s+/g, '')) return row[key]
    }
  }
  return 0
}

// ✨ Badge pakai 3 kelas warna yang sudah ada di CSS global: green / yellow / red
const kelasBadge = (totalMenit) => {
  const hari = menitKeHari(totalMenit)
  if (hari >= BATAS_WARNING2) return { kelas: 'red', label: '🚨 Warning 2' }
  if (hari >= BATAS_WARNING1) return { kelas: 'red', label: '⚠️ Warning 1' }
  return { kelas: 'yellow', label: 'Pantauan' }
}

function Pelanggaran({ user }) {
  const isAdmin = user.role === 'admin_kepegawaian' || user.role === 'superadmin'

  const [dataPelanggaran, setDataPelanggaran] = useState([])
  const [uploadInfo, setUploadInfo] = useState('')
  const [showWarning, setShowWarning] = useState(true)
  const [currentPagePelanggaran, setCurrentPagePelanggaran] = useState(0)
  const [currentPageRiwayat, setCurrentPageRiwayat] = useState(0)

  const [showFormPegawai, setShowFormPegawai] = useState(false)
  const [formPegawai, setFormPegawai] = useState({ nama: '', nip: '', password: '' })
  const [loadingTambah, setLoadingTambah] = useState(false)
  const [errorTambah, setErrorTambah] = useState('')
  const [infoTambah, setInfoTambah] = useState('')

  const [inputMenit, setInputMenit] = useState({})
  const [dropdownTambah, setDropdownTambah] = useState({})

  const muatData = async () => {
    const res = await api('/pelanggaran')
    const json = await res.json()
    if (json.success) {
      setDataPelanggaran(
        json.data.map((d) => ({
          ...d,
          tk: Number(d.tk),
          total: Number(d.total),
          tl1: Number(d.tl1),
          tl2: Number(d.tl2),
          tl3: Number(d.tl3),
          psw1: Number(d.psw1),
          psw2: Number(d.psw2),
          psw3: Number(d.psw3),
          psw4: Number(d.psw4),
          riwayat: (d.riwayat || []).map((r) => ({
            ...r,
            tk: Number(r.tk),
            total: Number(r.total),
            tl1: Number(r.tl1),
            tl2: Number(r.tl2),
            tl3: Number(r.tl3),
            psw1: Number(r.psw1),
            psw2: Number(r.psw2),
            psw3: Number(r.psw3),
            psw4: Number(r.psw4),
          })),
        }))
      )
    }
  }

  useEffect(() => {
    muatData()
  }, [])

  const catatanku = !isAdmin ? dataPelanggaran.find((d) => d.nip === user.nip) : null
  const hariAku = catatanku ? menitKeHari(catatanku.total) : 0

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const wb = XLSX.read(ev.target.result, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws)

      let masuk = 0
      let diskip = 0
      const waktu = new Date().toLocaleString('id-ID')
      const hasil = []

      rows.forEach((r) => {
        const nip = String(cariKolom(r, 'NIP', 'nip')).trim()
        const nama = String(cariKolom(r, 'NAMA', 'Nama', 'nama') || '').trim()
        const tk = Number(cariKolom(r, 'TK', 'tk')) || 0
        const tl1 = Number(cariKolom(r, 'TL1', 'TL 1')) || 0
        const tl2 = Number(cariKolom(r, 'TL2', 'TL 2')) || 0
        const tl3 = Number(cariKolom(r, 'TL3', 'TL 3')) || 0
        const psw1 = Number(cariKolom(r, 'PSW1', 'PSW 1')) || 0
        const psw2 = Number(cariKolom(r, 'PSW2', 'PSW 2')) || 0
        const psw3 = Number(cariKolom(r, 'PSW3', 'PSW 3')) || 0
        const psw4 = Number(cariKolom(r, 'PSW4', 'PSW 4')) || 0
        const total = tk + tl1 + tl2 + tl3 + psw1 + psw2 + psw3 + psw4

        if (!nip) return
        if (total === 0) {
          diskip++
          return
        }

        masuk++
        hasil.push({
          nip, nama: nama || nip, tk,
          tl1, tl2, tl3, psw1, psw2, psw3, psw4, total,
          tanggal: waktu,
          sumber: `Upload ${file.name}`,
        })
      })

      if (hasil.length > 0) {
        await api('/pelanggaran/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows: hasil }),
        })
        muatData()
      }

      setUploadInfo(`✅ ${masuk} pelanggar diproses, ${diskip} dilewati.`)
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  const updateJumlah = (id, nilai) => {
    const angka = Number(nilai) || 0
    setDataPelanggaran(
      dataPelanggaran.map((d) =>
        d.id === id ? { ...d, total: angka } : d
      )
    )
    api('/pelanggaran/' + id + '/jumlah', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jumlah: angka }),
    })
  }

  const tambahMenit = (id, menitTambah) => {
    if (!menitTambah || menitTambah === '') return
    const current = dataPelanggaran.find((d) => d.id === id)?.total || 0
    const baru = current + Number(menitTambah)

    setDataPelanggaran(
      dataPelanggaran.map((d) =>
        d.id === id ? { ...d, total: baru } : d
      )
    )

    api('/pelanggaran/' + id + '/jumlah', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jumlah: baru }),
    })

    setDropdownTambah((prev) => ({ ...prev, [id]: '' }))
  }

  const tambahPegawai = async (e) => {
    e.preventDefault()
    setErrorTambah('')
    setInfoTambah('')
    setLoadingTambah(true)

    try {
      const res = await api('/pelanggaran/tambah-pegawai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formPegawai),
      })
      const json = await res.json()

      if (json.success) {
        setInfoTambah(`✅ ${formPegawai.nama} (${formPegawai.nip}) berhasil didaftarkan.`)
        setFormPegawai({ nama: '', nip: '', password: '' })
      } else {
        setErrorTambah(json.message || 'Gagal menambahkan pegawai.')
      }
    } catch {
      setErrorTambah('Tidak bisa terhubung ke server.')
    } finally {
      setLoadingTambah(false)
    }
  }

  const hapus = async (id) => {
    if (window.confirm('Yakin ingin menghapus catatan ini?')) {
      await api('/pelanggaran/' + id, { method: 'DELETE' })
      muatData()
    }
  }

  const totalMenitSemua = dataPelanggaran.reduce((a, b) => a + b.total, 0)
  const jumlahWarning1 = dataPelanggaran.filter((d) => {
    const h = menitKeHari(d.total)
    return h >= BATAS_WARNING1 && h < BATAS_WARNING2
  }).length
  const jumlahWarning2 = dataPelanggaran.filter((d) => menitKeHari(d.total) >= BATAS_WARNING2).length

  return (
    <div className="page">
      {/* 🚨 Popup peringatan -- pakai class warning-* bawaan (sudah ada animasinya) */}
      {!isAdmin && catatanku && showWarning && hariAku >= BATAS_WARNING2 && (
        <div className="warning-overlay">
          <div className="warning-card warning-card-2">
            <div className="warning-icon">🚨</div>
            <div className="warning-title">WARNING 2</div>
            <div className="warning-hours">{bulatkan2(hariAku)} HARI KERJA</div>
            <p className="warning-text"><b>{kalimatSanksi(hariAku)}</b></p>
            <button className="warning-btn" onClick={() => setShowWarning(false)}>Saya Mengerti</button>
          </div>
        </div>
      )}
      {!isAdmin && catatanku && showWarning && hariAku >= BATAS_WARNING1 && hariAku < BATAS_WARNING2 && (
        <div className="warning-overlay">
          <div className="warning-card">
            <div className="warning-icon">⚠️</div>
            <div className="warning-title">WARNING 1</div>
            <div className="warning-hours">{bulatkan2(hariAku)} HARI KERJA</div>
            <p className="warning-text"><b>{kalimatSanksi(hariAku)}</b></p>
            <button className="warning-btn" onClick={() => setShowWarning(false)}>Saya Mengerti</button>
          </div>
        </div>
      )}

      <div className="page-title">
        <h1>Pelanggaran</h1>
        <p>
          {isAdmin
            ? 'Upload Excel rekap pelanggaran (satuan menit), lalu sesuaikan di kolom "Total Menit".'
            : 'Data pelanggaran kehadiran Anda.'}
        </p>
      </div>

      {!isAdmin && <div className="guest-note">🔒 Data pribadi — hanya Anda yang bisa melihat catatan ini.</div>}

      {isAdmin && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h3>Upload Excel Pelanggaran</h3>
            <button
              type="button"
              className="btn"
              onClick={() => { setShowFormPegawai(!showFormPegawai); setErrorTambah(''); setInfoTambah('') }}
            >
              {showFormPegawai ? 'Tutup' : '+ Tambah Pegawai'}
            </button>
          </div>
          <p className="form-info" style={{ marginTop: 0 }}>Kolom: NAMA, NIP, TK, TL 1–3, PSW 1–4 (satuan menit).</p>

          {showFormPegawai && (
            <form onSubmit={tambahPegawai} style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              {errorTambah && <div className="login-error" style={{ marginBottom: '12px' }}>{errorTambah}</div>}
              {infoTambah && <div className="filter-info">{infoTambah}</div>}
              <div className="form-row">
                <input type="text" value={formPegawai.nama} onChange={(e) => setFormPegawai({ ...formPegawai, nama: e.target.value })} required placeholder="Nama Lengkap" />
                <input type="text" value={formPegawai.nip} onChange={(e) => setFormPegawai({ ...formPegawai, nip: e.target.value })} required placeholder="NIP (jadi username login)" />
                <input type="text" value={formPegawai.password} onChange={(e) => setFormPegawai({ ...formPegawai, password: e.target.value })} required minLength={6} placeholder="Password awal (min 6 karakter)" />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button type="submit" className="btn" disabled={loadingTambah}>
                  {loadingTambah ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFormPegawai(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#fff',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
              </div>
            </form>
          )}

          <div className="form-row" style={{ marginTop: '16px' }}>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} />
          </div>
          {uploadInfo && <div className="filter-info">{uploadInfo}</div>}
        </div>
      )}

      <div className="stats-grid">
        {isAdmin && <StatCard title="Pegawai Terdeteksi" value={dataPelanggaran.length} icon="👥" />}
        <StatCard
          title={isAdmin ? 'Total Hari Terlambat' : 'Hari Kerja Terlambat Anda'}
          value={`${bulatkan2(menitKeHari(isAdmin ? totalMenitSemua : (catatanku ? catatanku.total : 0)))} hari`}
          icon="⏱️"
        />
        {isAdmin && <StatCard title="Warning 1" value={jumlahWarning1} icon="⚠️" variant="gold" />}
        {isAdmin && <StatCard title="Warning 2" value={jumlahWarning2} icon="🚨" />}
        {!isAdmin && <StatCard title="Batas Warning" value={`${BATAS_WARNING1}h (W1) • ${BATAS_WARNING2}h (W2)`} icon="📏" variant="green" />}
      </div>

      <div className="card">
        <h3>{isAdmin ? 'Daftar Pelanggaran' : 'Riwayat Pelanggaran Saya'}</h3>
        <p className="form-info" style={{ marginTop: '-10px', marginBottom: '14px' }}>
          {isAdmin
            ? 'Edit "Total Menit" atau pakai dropdown "Tambah..." untuk menambah akumulasi.'
            : 'Rincian pelanggaran dari tiap upload.'}
        </p>

        <div className="table-wrap">
          {isAdmin ? (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th>NIP</th>
                    <th>Nama</th>
                    <th>TK</th>
                    <th>TL 1</th>
                    <th>TL 2</th>
                    <th>TL 3</th>
                    <th>PSW 1</th>
                    <th>PSW 2</th>
                    <th>PSW 3</th>
                    <th>PSW 4</th>
                    <th>Total Menit</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const ITEMS_PER_PAGE = 10
                    const startIndex = currentPagePelanggaran * ITEMS_PER_PAGE
                    const dataPaginated = dataPelanggaran.slice(startIndex, startIndex + ITEMS_PER_PAGE)

                    if (dataPaginated.length === 0) {
                      return (
                        <tr>
                          <td colSpan="13" style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                            Belum ada data. Upload Excel untuk memulai.
                          </td>
                        </tr>
                      )
                    }

                    return dataPaginated.map((d) => {
                      const badge = kelasBadge(d.total)
                      const nilaiDisplay = inputMenit[d.id] !== undefined ? inputMenit[d.id] : String(d.total)

                      return (
                        <tr key={d.id}>
                          <td>{d.nip}</td>
                          <td><strong>{d.nama}</strong></td>
                          <td>{d.tk}</td>
                          <td style={selCell(d.tl1)}>{d.tl1}</td>
                          <td style={selCell(d.tl2)}>{d.tl2}</td>
                          <td style={selCell(d.tl3)}>{d.tl3}</td>
                          <td style={selCell(d.psw1)}>{d.psw1}</td>
                          <td style={selCell(d.psw2)}>{d.psw2}</td>
                          <td style={selCell(d.psw3)}>{d.psw3}</td>
                          <td style={selCell(d.psw4)}>{d.psw4}</td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={nilaiDisplay}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/[^\d]/g, '')
                                setInputMenit({ ...inputMenit, [d.id]: raw === '' ? '' : String(Number(raw)) })
                              }}
                              onBlur={() => {
                                if (inputMenit[d.id] !== undefined) {
                                  updateJumlah(d.id, inputMenit[d.id])
                                  setInputMenit((prev) => {
                                    const baru = { ...prev }
                                    delete baru[d.id]
                                    return baru
                                  })
                                }
                              }}
                              className="pagu-input"
                              style={{ fontWeight: 700, textAlign: 'center' }}
                            />
                            <div style={{ fontSize: '10px', color: '#005ca9', fontWeight: 700, marginTop: '4px' }}>
                              = {bulatkan2(menitKeHari(d.total))} hari
                            </div>
                            <div style={{ fontSize: '10px', color: '#94a3b8' }}>{formatDurasi(d.total)}</div>

                            <select
                              value={dropdownTambah[d.id] || ''}
                              onChange={(e) => tambahMenit(d.id, e.target.value)}
                              style={{ marginTop: '6px', width: '130px', fontSize: '11px' }}
                            >
                              <option value="">+ Tambah...</option>
                              <option value="5">+ 5 menit</option>
                              <option value="10">+ 10 menit</option>
                              <option value="15">+ 15 menit</option>
                              <option value="20">+ 20 menit</option>
                              <option value="25">+ 25 menit</option>
                              <option value="30">+ 30 menit</option>
                              <option value="45">+ 45 menit</option>
                              <option value="60">+ 1 jam</option>
                              <option value="90">+ 1.5 jam</option>
                              <option value="120">+ 2 jam</option>
                            </select>
                          </td>
                          <td><span className={`badge ${badge.kelas}`}>{badge.label}</span></td>
                          <td><button className="btn-danger" onClick={() => hapus(d.id)}>Hapus</button></td>
                        </tr>
                      )
                    })
                  })()}
                </tbody>
              </table>
              <Pagination
                page={currentPagePelanggaran}
                total={dataPelanggaran.length}
                onPrev={() => setCurrentPagePelanggaran((p) => Math.max(0, p - 1))}
                onNext={() => setCurrentPagePelanggaran((p) => (p + 1 < Math.ceil(dataPelanggaran.length / 10) ? p + 1 : p))}
              />
            </>
          ) : catatanku ? (
            <>
              <div className="filter-row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#005ca9', fontWeight: 600, marginBottom: '4px' }}>AKUMULASI KETERLAMBATAN ANDA</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#b91c1c' }}>{bulatkan2(hariAku)} hari kerja</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>= {formatDurasi(catatanku.total)} ({catatanku.total} menit)</div>
                </div>
                <span className={`badge ${kelasBadge(catatanku.total).kelas}`} style={{ fontSize: '13px', padding: '8px 14px' }}>
                  {kelasBadge(catatanku.total).label}
                </span>
              </div>

              <table className="table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Waktu</th>
                    <th>TK</th>
                    <th>TL 1</th>
                    <th>TL 2</th>
                    <th>TL 3</th>
                    <th>PSW 1</th>
                    <th>PSW 2</th>
                    <th>PSW 3</th>
                    <th>PSW 4</th>
                    <th>Akumulasi</th>
                    <th>Sumber</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const ITEMS_PER_PAGE = 10
                    const startIndex = currentPageRiwayat * ITEMS_PER_PAGE
                    const dataPaginated = catatanku.riwayat.slice(startIndex, startIndex + ITEMS_PER_PAGE)

                    return dataPaginated.map((r, i) => (
                      <tr key={r.id}>
                        <td>{startIndex + i + 1}</td>
                        <td>{r.tanggal}</td>
                        <td style={selCell(r.tk)}>{r.tk}</td>
                        <td style={selCell(r.tl1)}>{r.tl1}</td>
                        <td style={selCell(r.tl2)}>{r.tl2}</td>
                        <td style={selCell(r.tl3)}>{r.tl3}</td>
                        <td style={selCell(r.psw1)}>{r.psw1}</td>
                        <td style={selCell(r.psw2)}>{r.psw2}</td>
                        <td style={selCell(r.psw3)}>{r.psw3}</td>
                        <td style={selCell(r.psw4)}>{r.psw4}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 700, color: '#b91c1c' }}>{bulatkan2(menitKeHari(Number(r.total) || 0))} hari</div>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>{formatDurasi(Number(r.total) || 0)}</div>
                        </td>
                        <td>{r.sumber}</td>
                      </tr>
                    ))
                  })()}
                </tbody>
              </table>
              <Pagination
                page={currentPageRiwayat}
                total={catatanku.riwayat.length}
                onPrev={() => setCurrentPageRiwayat((p) => Math.max(0, p - 1))}
                onNext={() => setCurrentPageRiwayat((p) => (p + 1 < Math.ceil(catatanku.riwayat.length / 10) ? p + 1 : p))}
              />
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '50px' }}>
              Tidak ada pelanggaran tercatat atas nama Anda. Pertahankan! 🎉
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, variant }) {
  return (
    <div className={`stat-card${variant ? ' ' + variant : ''}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <h4>{title}</h4>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  )
}

const pagerBtnStyle = (disabled) => ({
  padding: '6px 14px',
  borderRadius: '6px',
  border: 'none',
  backgroundColor: '#7ea6db',
  color: '#fff',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.6 : 1,
  fontSize: '11px',
  fontWeight: 600,
})

function Pagination({ page, total, onPrev, onNext }) {
  const totalPages = Math.max(1, Math.ceil(total / 10))
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
      <button className="btn" onClick={onPrev} disabled={page === 0} style={pagerBtnStyle(page === 0)}>Back</button>
      <span style={{ fontSize: '11px', fontWeight: 500, color: '#64748b' }}>{page + 1} / {totalPages}</span>
      <button className="btn" onClick={onNext} disabled={page + 1 >= totalPages} style={pagerBtnStyle(page + 1 >= totalPages)}>Next</button>
    </div>
  )
}

const selCell = (v) => ({ textAlign: 'center', color: v > 0 ? '#dc2626' : '#94a3b8', fontWeight: v > 0 ? 700 : 400 })

export default Pelanggaran